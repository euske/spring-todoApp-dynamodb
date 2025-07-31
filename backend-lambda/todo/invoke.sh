#!/bin/bash
JQ=${JQ:-jq}
CURL=${curl:-curl}
AWSCLI=${AWSCLI:-awslocal}
AWS_REGION=${AWS_REGION:-ap-northeast-1}

nargs=$#
[ $nargs -lt 1 ] && echo "usage: $0 function_name [endpoint_path] [args ...]" && exit 1

function_name=$1; shift
endpoint_path=${1:-/}; shift

function_url=$(
  ${AWSCLI} lambda get-function-url-config --region="$AWS_REGION" --function-name="$function_name" |
  ${JQ} -r '.FunctionUrl'
)

[ $nargs -lt 2 ] && echo "$function_url" && exit 0
exec $CURL "$@" "${function_url}${endpoint_path}"