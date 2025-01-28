#!/bin/bash
set -x
AWSCLI=${AWSCLI:-awslocal}

$AWSCLI dynamodb create-table \
  --region ap-northeast-1 \
  --table-name todo \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
