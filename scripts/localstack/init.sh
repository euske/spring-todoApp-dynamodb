#!/bin/bash
set -x
AWSCLI=${AWSCLI:-awslocal}

$AWSCLI dynamodb create-table \
  --region ap-northeast-1 \
  --billing-mode PAY_PER_REQUEST \
  --table-name todo \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH
