"""US Office July 2019 published-coefficient reference, not an EPA certification."""
import math

NAMES = ['floor_area', 'hours', 'workers', 'computers', 'cooling', 'small_bank']
COEFFICIENTS = [0.0006768, 0.6130, 15.90, 10.13, 4.529, 82.87]

def number(value, name, minimum=0, maximum=1e12):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not minimum <= value <= maximum:
        raise ValueError(f'{name} must be a finite number between {minimum} and {maximum}')
    return value

def features(p):
    a = number(p['sqft'], 'sqft', 1)
    hours = number(p['weekly_hours'], 'weekly_hours', 0, 168)
    workers = number(p['workers'], 'workers')
    computers = number(p['computers'], 'computers')
    cooled = number(p['percent_cooled'], 'percent_cooled', 0, 100)
    cdd = number(p['cdd65'], 'cdd65', 0, 100000)
    number(p['hdd65'], 'hdd65', 0, 100000)
    bank = p.get('is_bank_or_financial', False)
    if not isinstance(bank, bool):
        raise ValueError('is_bank_or_financial must be boolean')
    # Zero CDD handling is an explicit implementation convention, not verified EPA behavior.
    return [min(a,100000)-12342, hours-54.09, workers/a*1000-2.056,
            computers/a*1000-3.028, cooled/100*math.log(max(cdd,1))-6.332,
            int(bank and a<=50000)]

def predict(p):
    x = features(p)
    terms = dict(zip(NAMES, [a*b for a,b in zip(x,COEFFICIENTS)]))
    terms['intercept'] = 143.1
    terms['heating'] = .004693*max(p['hdd65']-924,0)
    result = sum(terms.values())
    if result <= 0: raise ValueError('Predicted EUI is nonpositive; inputs outside supported model domain')
    return result, terms
