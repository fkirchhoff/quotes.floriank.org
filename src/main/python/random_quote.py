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

authors = table.query(
    KeyConditionExpression=Key('PK').eq("AUTHORS")
)

def lambda_handler(event, context):
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    if action == 'tags':
        return {
            'statusCode': 200,
            'body': tags['Items']
        }

    if action == 'authors':
        return {
            'statusCode': 200,
            'body': authors['Items']
        }

    tag_id = params.get('tagId', '')
    author_id = params.get('authorId', '')

    quotes = []
    quote = "{}"
    while len(quotes) == 0:
        if tag_id:
            selected_tag_id = tag_id
        else:
            selected_tag_id = random.choice(tags['Items'])["tagId"]

        q_id = "Q#" + hex(randint(0, 15))[2:]
        logging.debug("random tag :" + selected_tag_id + " and quote beginning: " + q_id)

        if author_id:
            # Filter by tag and author using GSI1
            response = table.query(
                Limit=100,
                IndexName="GSI1",
                KeyConditionExpression=Key('tagId').eq(selected_tag_id) & Key('PK').begins_with("A#" + author_id + "#Q#"),
                ReturnConsumedCapacity='TOTAL'
            )
        else:
            response = table.query(
                Limit=100,
                IndexName="GSI1",
                KeyConditionExpression=Key('tagId').eq(selected_tag_id) & Key('PK').begins_with(q_id),
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
