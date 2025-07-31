#!/bin/bash
JQ=${JQ:-jq}
CURL=${curl:-curl}
AWSCLI=${AWSCLI:-awslocal}
REGION=${REGION:-ap-northeast-1}

function_name=$1; shift

function_url=$(
  ${AWSCLI} lambda get-function-url-config --region="$REGION" --function-name="$function_name" |
  ${JQ} -r '.FunctionUrl'
)

exec $CURL "$@" "$function_url"