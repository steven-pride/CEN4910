"""HDD65/CDD65 from NOAA GSOD daily mean temperatures in Fahrenheit.
Station selection is explicit; this module does not guess EPA ZIP mappings.
"""
import csv
import hashlib
import io
import re
import time
from datetime import date,timedelta
from urllib.error import URLError
from urllib.request import urlopen
from model import number

BASE_URL='https://www.ncei.noaa.gov/data/global-summary-of-the-day/access'
_CACHE={}
MAX_DOWNLOAD=2_000_000

class WeatherUnavailable(Exception):
    """NOAA could not supply a valid response."""

def period(start,end):
    start,end=date.fromisoformat(start),date.fromisoformat(end)
    if not 0<(end-start).days<=366: raise ValueError('Weather period must contain 1–366 days')
    return start,end

def station_id(value):
    if not isinstance(value,str) or re.fullmatch(r'[0-9]{11}',value) is None:
        raise ValueError('station_id must be an 11-digit NOAA USAF+WBAN identifier')
    return value

def parse_gsod(text,station):
    """Ignore NOAA's missing-TEMP sentinel; never substitute MAX/MIN midpoint."""
    reader=csv.DictReader(io.StringIO(text))
    if not {'STATION','DATE','TEMP'}.issubset(reader.fieldnames or []):
        raise ValueError('Invalid GSOD CSV columns')
    rows=[]; seen=set()
    for r in reader:
        if r['STATION']!=station: raise ValueError('GSOD station does not match request')
        day=date.fromisoformat(r['DATE'])
        if day in seen: raise ValueError('Duplicate GSOD date')
        seen.add(day)
        temp=r['TEMP'].strip()
        if not temp: continue
        temp=float(temp)
        if temp==9999.9: continue
        number(temp,'GSOD TEMP',-150,150)
        rows.append({'date':day.isoformat(),'mean_f':temp})
    return rows

def fetch_year(station,year):
    key=(station,year)
    cached=_CACHE.get(key)
    if cached and time.monotonic()-cached[0]<3600: return cached[1]
    url=f'{BASE_URL}/{year}/{station}.csv'
    try:
        with urlopen(url,timeout=8) as response:
            content=response.read(MAX_DOWNLOAD+1)
        if len(content)>MAX_DOWNLOAD: raise ValueError('GSOD response exceeds size limit')
        rows=parse_gsod(content.decode('utf-8-sig'),station)
    except (URLError,OSError,ValueError,UnicodeError) as exc:
        raise WeatherUnavailable(f'NOAA weather unavailable for station {station}, year {year}') from exc
    result=(rows,{'url':url,'sha256':hashlib.sha256(content).hexdigest()})
    if len(_CACHE)>=8: _CACHE.pop(next(iter(_CACHE)))
    _CACHE[key]=(time.monotonic(),result)
    return result

def summarize(rows,start,end,interpolate=False,monthly_normals=None,allow_context=False):
    start,end=period(start,end)
    if not isinstance(rows,list) or len(rows)>1100: raise ValueError('Weather rows must be a list of at most 1100 observations')
    if not isinstance(interpolate,bool): raise ValueError('interpolate must be boolean')
    normals={} if monthly_normals is None else monthly_normals
    if not isinstance(normals,dict): raise ValueError('monthly_normals must be an object keyed by YYYY-MM')
    data={}
    for row in rows:
        day=date.fromisoformat(row['date'])
        if day in data: raise ValueError('Duplicate weather date')
        if not allow_context and not start<=day<end: raise ValueError('Weather outside reporting period')
        data[day]=number(row['mean_f'],'mean_f',-150,150)
    observed=dict(data)
    months={}
    day=start
    while day<end:
        months.setdefault(day.strftime('%Y-%m'),[]).append(day)
        day+=timedelta(days=1)
    monthly={}; fills=[]
    for key,days in months.items():
        missing=[day for day in days if day not in data]
        if len(missing)==len(days):
            next_month=(days[0].replace(day=28)+timedelta(days=4)).replace(day=1)
            if days[0].day!=1 or days[-1]+timedelta(days=1)!=next_month:
                raise ValueError(f'Missing partial month {key}; full-month normals cannot be prorated')
            normal=normals.get(key)
            if not isinstance(normal,dict): raise ValueError(f'Missing month {key}; supply station-matched monthly HDD65/CDD65 normals')
            if not isinstance(normal.get('source'),str) or not normal['source'].strip():
                raise ValueError('Monthly normal requires source provenance')
            monthly[key]={'hdd65':number(normal['hdd65'],'normal hdd65',0,100000),
                          'cdd65':number(normal['cdd65'],'normal cdd65',0,100000),
                          'observed_days':0,'interpolated_days':0,'normal_days':len(days),'normal_source':normal['source']}
            continue
        for day in missing:
            if not interpolate: raise ValueError(f'Missing weather date {day}; interpolation is disabled')
            # Always use original observations, never sequentially filled values.
            before=max((d for d in observed if d<day),default=None)
            after=min((d for d in observed if d>day),default=None)
            if before is None or after is None: raise ValueError(f'Cannot bracket missing weather date {day}')
            if (after-before).days>31: raise ValueError('Gap too long for daily interpolation')
            # EPA describes averaging preceding/following days. For multiple-day gaps,
            # use their bracketing observations' average for each day (explicit convention).
            data[day]=(observed[before]+observed[after])/2
            fills.append(day.isoformat())
        monthly[key]={'hdd65':sum(max(65-data[d],0) for d in days),
                      'cdd65':sum(max(data[d]-65,0) for d in days),
                      'observed_days':len(days)-len(missing),'interpolated_days':len(missing),'normal_days':0}
    return {'hdd65':sum(m['hdd65'] for m in monthly.values()),
            'cdd65':sum(m['cdd65'] for m in monthly.values()),'base_f':65,
            'monthly':monthly,'interpolated_dates':fills,
            'normal_months':[k for k,m in monthly.items() if m['normal_days']]}

def degree_days(rows,start,end):
    """Compatibility API: complete supplied observations, no imputation."""
    result=summarize(rows,start,end)
    return {k:result[k] for k in ('hdd65','cdd65')}

def noaa_weather(config,start,end):
    if not isinstance(config,dict): raise ValueError('weather must be an object')
    if config.get('source')!='noaa_gsod': raise ValueError('weather.source must be noaa_gsod')
    station=station_id(config['station_id'])
    a,b=period(start,end)
    if a.year<1901 or b>date.today(): raise ValueError('NOAA reporting period must be historical, from 1901 onward')
    rows=[]; sources=[]
    for year in range(a.year,(b-timedelta(days=1)).year+1):
        year_rows,source=fetch_year(station,year)
        rows.extend(year_rows); sources.append(source)
    result=summarize(rows,start,end,config.get('interpolate',True),config.get('monthly_normals'),allow_context=True)
    result.update(source='noaa_gsod',station_id=station,sources=sources,
                  station_assignment='caller_supplied; EPA ZIP mapping not verified')
    return result
