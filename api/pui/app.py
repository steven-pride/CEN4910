import asyncio
import base64
import json
from model import predict
from energy import aggregate
from weather import summarize,noaa_weather,WeatherUnavailable
from location import address_weather
from fastapi import FastAPI,Request
from fastapi.responses import Response

def calculate(payload):
    if not isinstance(payload,dict): raise ValueError('Expected JSON object')
    p=dict(payload['property'])
    warnings=['US Office July 2019 reference; eligibility and certification are not evaluated.']
    weather_result=None
    if 'daily_weather' in payload and 'weather' in payload:
        raise ValueError('Choose daily_weather or weather, not both')
    if 'daily_weather' in payload:
        weather_result=summarize(payload['daily_weather'],payload['period']['start'],payload['period']['end'])
        weather_result['source']='caller_supplied_daily'
    elif 'weather' in payload:
        config=payload['weather']
        if not isinstance(config,dict): raise ValueError('weather must be an object')
        resolve=address_weather if 'address' in config else noaa_weather
        weather_result=resolve(config,payload['period']['start'],payload['period']['end'])
    if weather_result is not None:
        p.update({k:weather_result[k] for k in ('cdd65','hdd65')})
        if weather_result['interpolated_dates']:
            warnings.append('Missing daily temperatures were filled using bracketing observations; see weather audit.')
        if weather_result['normal_months']:
            warnings.append('Entire missing months use caller-supplied climate normals; see weather audit.')
    if p['cdd65']<1: warnings.append('CDD is floored at 1 for logarithm; EPA boundary behavior not verified.')
    prediction,terms=predict(p)
    result={'model_version':'epa-office-2019-published','predicted_source_eui':prediction,'contributions':terms,'warnings':warnings}
    if weather_result is not None: result['weather']=weather_result
    else: result['weather']={'source':'caller_supplied_degree_days','cdd65':p['cdd65'],'hdd65':p['hdd65'],'base_f':65}
    if 'readings' in payload:
        energy=aggregate(payload['readings'],payload['period']['start'],payload['period']['end'])
        actual=energy['source_kbtu']/p['sqft']
        result.update(energy=energy,actual_source_eui=actual,efficiency_ratio=actual/prediction)
    return result

def handler(event,context=None):
    try:
        method=event.get('requestContext',{}).get('http',{}).get('method','POST')
        path=event.get('rawPath','/predict')
        if method=='GET' and path=='/health': return response(200,{'status':'ok'})
        if path!='/predict': return response(404,{'error':'Not found'})
        if method!='POST': return response(405,{'error':'POST required'})
        body=event.get('body','')
        if event.get('isBase64Encoded'): body=base64.b64decode(body,validate=True).decode()
        if len(body)>1_000_000: return response(413,{'error':'Body too large'})
        return response(200,calculate(json.loads(body)))
    except WeatherUnavailable as exc:
        return response(502,{'error':str(exc)})
    except (ValueError,KeyError,TypeError,OverflowError) as exc:
        return response(400,{'error':str(exc)})

def response(status,body):
    return {'statusCode':status,'headers':{'Content-Type':'application/json'},'body':json.dumps(body,allow_nan=False)}

app=FastAPI(title='Projected EUI API')

@app.get('/health')
async def health():
    return {'status':'ok'}

@app.post('/predict')
async def predict_endpoint(request:Request):
    event={'rawPath':'/predict','requestContext':{'http':{'method':'POST'}},'body':await request.body()}
    result=await asyncio.to_thread(handler,event)
    return Response(content=result['body'],status_code=result['statusCode'],headers=result['headers'])

if __name__=='__main__':
    import uvicorn
    uvicorn.run(app,host='127.0.0.1',port=8088)
