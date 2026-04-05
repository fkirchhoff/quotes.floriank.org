import csv
import boto3
import hashlib
from uuid import uuid4

#can you add types to the variables?
filters_chars:list = list("\"&()/0123456789:=?@[]^_~¡авдиклмнорстхћأإابةتجحدذرزسصطظعغفقكلمنويกคงฒทปพมยรลวหาิีุ’▲☯")
tags_map:dict = {}
authors_set:set = set([])
quotes:list = []


def readable(author):
    chars_author = list(author)
    for c in chars_author:
        if (c in filters_chars):
            return False
    return True


with open('quotes_dataset.csv', newline='', encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='"')
    i = 0
    err = 0
    for row in reader:
        if (len(row[4]) > 0 or len(row[0]) > 50):
            continue
        i = i + 1
        quote = row[0]
        qauthor_and_source = row[1].split(',')
        author = qauthor_and_source[0].strip()
        source = ""
        if len(qauthor_and_source) > 1:
            source = qauthor_and_source[1].strip()
        authors_set.add(author)
        qtags = [tag.strip() for tag in row[2].split(',')]
        for tag in qtags:
            if not tag in tags_map:
                tags_map[tag] = 1
            else:
                tags_map[tag] = tags_map[tag] + 1
        quotes.append([quote, author, source, qtags])
print("# quotes=" + str(i))
print("# authors=" + str(len(authors_set)))
print("# of tags=" + str(len(tags_map)))

sorted_counts = sorted((tags_map[tag], tag) for tag in tags_map)
select_tags = []
for cnt, tag in sorted_counts:
    if (cnt > 500):
        select_tags.append(tag)

select_quotes:list = list(filter(lambda q: len(set(q[3]).intersection(select_tags)) > 0, quotes))
print(len(select_tags))
print(len(select_quotes))

dynamodb = boto3.resource("dynamodb")
dynamodb.Table("quotes")
try:
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
        GlobalSecondaryIndexes=[
            {
                'IndexName': 'GSI1',
                'KeySchema': [
                    {
                        'AttributeName': 'tagId',
                        'KeyType': 'HASH'
                    },
                    {
                        'AttributeName': 'PK',
                        'KeyType': 'RANGE'
                    }
                ],
                'Projection': {
                    'ProjectionType': 'ALL'
                },
                'ProvisionedThroughput': {
                    'ReadCapacityUnits': 1,
                    'WriteCapacityUnits': 1
                }
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
            },
            {
                'AttributeName': 'tagId',
                'AttributeType': 'S'
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 1,
            'WriteCapacityUnits': 1
        }
    )
except dynamodb.meta.client.exceptions.ResourceInUseException:
    pass

table = dynamodb.Table("quotes")

with table.batch_writer() as batch:
    for tag in select_tags:
        content = {
            "PK": "TAGS",
            "SK": "T#" + tag,
            "type": "TAG",
            "tagId": "T#" + tag
        }
        batch.put_item(Item=content)

    i = 0
    for select_quote in select_quotes:
        quote = select_quote[0]
        author = select_quote[1]
        source = select_quote[2]
        tag = select_quote[3][0]
        if (readable(author)):
            i = i + 1
            if (i % 100 == 0):
                print(str(i))
            content = {
                "PK": "Q#" + hashlib.md5(quote.encode("utf-8")).hexdigest(),
                "SK": "METADATA",
                "type": "quote",
                "author": author,
                "source": source,
                "quote": quote,
                "tagId": "T#" + tag
            }
            batch.put_item(Item=content)
