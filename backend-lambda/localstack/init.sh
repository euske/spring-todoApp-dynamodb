#!/bin/bash
set -x
export AWSCLI=${AWSCLI:-awslocal}
export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-ap-northeast-1}

TABLE_NAME=todo
ENVIRONMENTS='Variables={DYNAMODB_TABLE_NAME=todo}'
HANDLER_NAME=index.handler
FUNCTION_NAMES=todo-lambda

$AWSCLI iam create-role \
  --role-name lambda-execution \
  --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}'

$AWSCLI iam attach-role-policy \
  --role-name lambda-execution \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

$AWSCLI dynamodb create-table \
  --billing-mode PAY_PER_REQUEST \
  --table-name $TABLE_NAME \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH

mkdir /tmp/empty
zip empty.zip /tmp/empty

for function_name in $FUNCTION_NAMES; do
  $AWSCLI lambda create-function \
    --function-name "$function_name" \
    --runtime nodejs20.x \
    --role arn:aws:iam::000000000000:role/lambda-execution \
    --zip-file fileb://empty.zip \
    --environment "$ENVIRONMENTS" \
    --handler $HANDLER_NAME

  $AWSCLI lambda create-function-url-config \
    --function-name "$function_name" \
    --auth-type NONE
done
