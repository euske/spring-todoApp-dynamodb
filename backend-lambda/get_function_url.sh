#!/bin/bash
JQ=${JQ:-jq}
AWSCLI=${AWSCLI:-awslocal}
REGION=${REGION:-ap-northeast-1}

function_name=$1; shift

${AWSCLI} lambda get-function-url-config --region=${REGION} --function-name=${function_name} |
  ${JQ} -r '.FunctionUrl'
