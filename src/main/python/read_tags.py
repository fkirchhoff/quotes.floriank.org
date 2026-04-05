import boto3
from boto3.dynamodb.conditions import Key
import hashlib
from uuid import uuid4
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("quotes")

# tags = table.query(
#     KeyConditionExpression=Key('PK').eq("TAGS")
# )
# print("The query returned the following items:")
# for item in tags['Items']:
#     print(item["tagId"])
#
hc=hashlib.md5(str(uuid4()).encode("utf-8")).hexdigest()
print(hc)
response  = table.query(
    Limit=100,
    IndexName="GSI1",
    KeyConditionExpression=Key('tagId').eq("T#humor") & Key('PK').begins_with("Q#0"),
    ReturnConsumedCapacity='TOTAL'
)
if response['Items']:
    for item in response['Items']:
        print({
            "Item": item,
        })
    print({
        "Capacity": response['ConsumedCapacity']['CapacityUnits'],
        "ScannedCount": response['ScannedCount']
    })