"""Address geocoding and nearest usable US weather station selection."""
import json,math
from datetime import timedelta
from functools import lru_cache
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen
from urllib.error import URLError
from model import number
from weather import WeatherUnavailable,noaa_weather,period

GEOCODER='https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'

def parse_geocode(document):
    try: matches=document['result']['addressMatches']
    except (TypeError,KeyError) as exc: raise WeatherUnavailable('Invalid Census geocoder response') from exc
    if not isinstance(matches,list): raise WeatherUnavailable('Invalid Census geocoder matches')
    if not matches: raise ValueError('Address could not be located. Provide street number, street, city, state and ZIP.')
    if len(matches)!=1: raise ValueError('Address is ambiguous. Provide the full street address, city, state and ZIP.')
    try:
        match=matches[0]
        lat=number(match['coordinates']['y'],'latitude',-90,90)
        lon=number(match['coordinates']['x'],'longitude',-180,180)
        matched=match['matchedAddress']
        if not isinstance(matched,str): raise ValueError('Invalid matched address')
    except (TypeError,KeyError,ValueError) as exc: raise WeatherUnavailable('Invalid Census geocoder coordinates') from exc
    return {'matched_address':matched,'latitude':lat,'longitude':lon,
            'geocoder':'US Census Public_AR_Current','coordinate_method':'address-range interpolation'}

def geocode(address):
    if not isinstance(address,str) or not 5<=len(address.strip())<=300:
        raise ValueError('address must be a US street address of 5–300 characters')
    # No addresses in logs, cache keys or source URLs returned to the caller.
    url=GEOCODER+'?'+urlencode({'address':address.strip(),'benchmark':'Public_AR_Current','format':'json'})
    try:
        with urlopen(url,timeout=8) as response: raw=response.read(100001)
        if len(raw)>100000: raise ValueError('Geocoder response too large')
        document=json.loads(raw)
    except (URLError,OSError,ValueError,UnicodeError) as exc:
        raise WeatherUnavailable('US Census geocoder is unavailable; retry the request') from exc
    return parse_geocode(document)

def distance_km(lat1,lon1,lat2,lon2):
    a,b=math.radians(lat1),math.radians(lat2)
    dlat=b-a;dlon=math.radians(lon2-lon1)
    h=math.sin(dlat/2)**2+math.cos(a)*math.cos(b)*math.sin(dlon/2)**2
    return 6371.0088*2*math.asin(math.sqrt(min(1,max(0,h))))

@lru_cache(maxsize=1)
def catalog():
    return json.loads(Path(__file__).with_name('stations.json').read_text())

def ranked_stations(latitude,longitude,start,end,inventory=None):
    a,b=period(start,end)
    inventory=catalog() if inventory is None else inventory
    last=(b-timedelta(days=1)).isoformat()
    result=[]
    for row in inventory['stations']:
        if row['begin']>a.isoformat() or row['end']<last: continue
        distance=distance_km(latitude,longitude,row['latitude'],row['longitude'])
        if distance<=250: result.append(dict(row,distance_km=distance))
    return sorted(result,key=lambda r:(r['distance_km'],r['station_id']))

def address_weather(config,start,end):
    if 'station_id' in config: raise ValueError('Provide address or station_id, not both')
    if 'monthly_normals' in config:
        raise ValueError('Station-specific monthly normals require an explicit station_id')
    if config.get('source')!='noaa_gsod': raise ValueError('weather.source must be noaa_gsod')
    interpolate=config.get('interpolate',True)
    if not isinstance(interpolate,bool): raise ValueError('interpolate must be boolean')
    a,b=period(start,end)
    from datetime import date
    if a.year<1901 or b>date.today(): raise ValueError('NOAA reporting period must be historical, from 1901 onward')
    location=geocode(config['address'])
    inventory=catalog()
    candidates=ranked_stations(location['latitude'],location['longitude'],start,end,inventory)
    if not candidates: raise ValueError('No station within 250 km has catalog coverage for this period. Refresh the catalog or choose a different period.')
    attempts=[]
    # Bound cold-request work. Test daily completeness, not just metadata date range.
    for station in candidates[:3]:
        try:
            result=noaa_weather({'source':'noaa_gsod','station_id':station['station_id'],'interpolate':interpolate},start,end)
        except (WeatherUnavailable,ValueError) as exc:
            attempts.append({'station_id':station['station_id'],'reason':str(exc)})
            continue
        result.update(station_assignment='nearest_usable_great_circle; not EPA ZIP/elevation mapping',
                      location=location,station=station,
                      selection={'method':'nearest by great-circle distance, with period coverage and usable GSOD data',
                                 'catalog_built':inventory['built'],'catalog_source':inventory['source'],
                                 'catalog_source_sha256':inventory['source_sha256'],'skipped_stations':attempts})
        return result
    raise WeatherUnavailable('None of the three nearest candidate stations supplied usable weather. Retry or refresh the station catalog.')
