#!/bin/bash
JQ=${JQ:-jq}
CURL=${curl:-curl}
AWSCLI=${AWSCLI:-awslocal}
AWS_REGION=${AWS_REGION:-ap-northeast-1}

nargs=$#
[ $nargs -lt 1 ] && echo "usage: $0 api_name [endpoint_path] [args ...]" && exit 1

api_name=$1; shift
endpoint_path=${1:-/}; shift

api_id=$(
  ${AWSCLI} apigateway get-rest-apis --region="$AWS_REGION" --query="items[?name=='$api_name']" |
  ${JQ} -r '.[0].id'
)

function_url="http://${api_id}.execute-api.${AWS_REGION}.localstack.localhost:4566"

[ $nargs -lt 2 ] && echo "$function_url" && exit 0
exec $CURL "$@" "${function_url}${endpoint_path}"