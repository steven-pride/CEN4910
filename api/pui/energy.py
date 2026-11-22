"""Explicit US fuel/unit subset; billing intervals are [start, end)."""
from datetime import date,timedelta
from model import number

THERMAL = {('electricity','kWh'):3.412, ('natural_gas','therm'):100,
           ('natural_gas','cf'):1.026, ('propane','gallon'):92,
           ('fuel_oil_2','gallon'):138}
SOURCE = {'electricity':2.80,'natural_gas':1.05,'propane':1.01,'fuel_oil_2':1.01}

def convert(fuel, unit, value):
    number(value,'consumption')
    if fuel not in SOURCE: raise ValueError('Unsupported fuel')
    factor = 1 if unit=='kBtu' else THERMAL.get((fuel,unit))
    if factor is None: raise ValueError(f'Unsupported fuel/unit: {fuel}/{unit}')
    site = value*factor
    return site,site*SOURCE[fuel]

def aggregate(readings, start, end):
    start,end = date.fromisoformat(start),date.fromisoformat(end)
    if end != start.replace(year=start.year+1): raise ValueError('Reporting period must be one calendar year in duration')
    if start.day != 1: raise ValueError('Reporting period must start on the first of a month')
    if not isinstance(readings,list) or not readings or len(readings)>10000: raise ValueError('Provide 1–10000 readings')
    meters, monthly = {}, {}
    for r in readings:
        a,b = date.fromisoformat(r['start']),date.fromisoformat(r['end'])
        if b<=a or (b-a).days>3660: raise ValueError('Invalid billing interval')
        site,source = convert(r['fuel'],r['unit'],r['value'])
        meter = meters.setdefault(r['meter_id'], {'fuel':r['fuel'],'days':set()})
        if meter['fuel'] != r['fuel']: raise ValueError('Meter fuel cannot change')
        day = max(a,start)
        while day < min(b,end):
            if day in meter['days']: raise ValueError('Overlapping meter readings')
            meter['days'].add(day)
            key = day.strftime('%Y-%m')
            row = monthly.setdefault(key,{'site_kbtu':0.,'source_kbtu':0.})
            row['site_kbtu'] += site/(b-a).days
            row['source_kbtu'] += source/(b-a).days
            day += timedelta(days=1)
    for meter in meters.values():
        if len(meter['days']) != (end-start).days: raise ValueError('Each meter must cover the full reporting year without gaps')
    return {'site_kbtu':sum(r['site_kbtu'] for r in monthly.values()),
            'source_kbtu':sum(r['source_kbtu'] for r in monthly.values()),'monthly':monthly}
