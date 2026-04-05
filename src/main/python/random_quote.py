import boto3
import random
import logging
from boto3.dynamodb.conditions import Key
from random import randint

logger = logging.getLogger()
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("quotes")

tags = table.query(
    KeyConditionExpression=Key('PK').eq("TAGS")
)

def lambda_handler(event, context):
    quotes = []
    quote = "{}"
    while len(quotes) == 0:
        tag_id = random.choice(tags['Items'])["tagId"]
        q_id = "Q#"+hex(randint(0, 15))[2:]
        logging.debug("random tag :"+tag_id+" and quote beginning: "+q_id)
        response = table.query(
            Limit=100,
            IndexName="GSI1",
            KeyConditionExpression=Key('tagId').eq(tag_id) & Key('PK').begins_with(q_id),
            ReturnConsumedCapacity='TOTAL'
        )

        quotes = response['Items']
        if len(quotes) > 0:
            quote = random.choice(quotes)
            logger.debug(quote)
            logger.debug({
                "Capacity": response['ConsumedCapacity']['CapacityUnits'],
                "ScannedCount": response['ScannedCount']
            })

    return {
        'statusCode': 200,
        'body': quote
    }
