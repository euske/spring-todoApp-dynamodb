#!/bin/bash
set -x
AWSCLI=${AWSCLI:-awslocal}
REGION=${REGION:-ap-northeast-1}

TABLE_NAME=todo

$AWSCLI dynamodb create-table \
  --region $REGION \
  --billing-mode PAY_PER_REQUEST \
  --table-name $TABLE_NAME \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH
