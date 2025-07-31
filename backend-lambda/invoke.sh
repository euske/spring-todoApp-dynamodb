#!/bin/bash
JQ=${JQ:-jq}
CURL=${curl:-curl}
AWSCLI=${AWSCLI:-awslocal}
REGION=${REGION:-ap-northeast-1}

[ $# -lt 2 ] && echo "usage: $0 function_name [path] [args ...]" && exit 1

function_name=$1; shift
path=${1:-/}; shift

function_url=$(
  ${AWSCLI} lambda get-function-url-config --region="$REGION" --function-name="$function_name" |
  ${JQ} -r '.FunctionUrl'
)

exec $CURL "$@" "${function_url}${path}"