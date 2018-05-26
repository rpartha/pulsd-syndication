
import time
import json
import boto3
import schedule
from datetime import datetime, date
from time import mktime as mktime

def scan_table(table):
    response = table.scan()

    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break

    return items

def getWithinPastHour(items):
    wph=[]
    for item in items:
        datetime_obj = item['datetime_added']
        if(str(date.today()) == datetime_obj[0:10]):
            added = datetime_obj[11:19]
            added_time = added.replace(added[0:2], str(int(added[0:2]) - 4))
            curr_time = str(datetime.now())[11:19]
            added_time_obj = datetime.strptime(added_time, '%H:%M:%S').time()
            curr_time_obj = datetime.strptime(curr_time, '%H:%M:%S').time()
            if(int(str(datetime.combine(date.today(), curr_time_obj) - datetime.combine(date.today(), added_time_obj))[0]) < 1 or 
                   str(datetime.combine(date.today(), curr_time_obj) - datetime.combine(date.today(), added_time_obj)) == '1:00:00'):
                wph.append(item)
    
    return wph

def printData(wph_events, wph_products):
    for event in wph_events:
        print(json.dumps(event, indent=4, sort_keys=True))

    for product in wph_products:
        print(json.dumps(product, indent=4, sort_keys=True))

if __name__ == '__main__':
    dynamodb = boto3.resource('dynamodb')
    events = dynamodb.Table('Events')
    products = dynamodb.Table('Products')

    items_events = scan_table(events)
    items_products = scan_table(products)

    wph_events = getWithinPastHour(items_events)
    wph_products = getWithinPastHour(items_products)

    #printData(wph_events, wph_products)

    schedule.every().hour.do(printData, wph_events, wph_products)

    while True:
        schedule.run_pending()
        time.sleep(1)
   