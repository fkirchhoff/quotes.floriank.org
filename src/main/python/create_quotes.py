import csv
import boto3
import hashlib

dynamodb = boto3.resource("dynamodb")
table = dynamodb.create_table(
    TableName='quotes',
    KeySchema=[
        {
            'AttributeName': 'PK',
            'KeyType': 'HASH'
        },
        {
            'AttributeName': 'SK',
            'KeyType': 'RANGE'
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'PK',
            'AttributeType': 'S'
        },
        {
            'AttributeName': 'SK',
            'AttributeType': 'S'
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 1,
        'WriteCapacityUnits': 1
    }

)
table = dynamodb.Table("quotes")
print(table)