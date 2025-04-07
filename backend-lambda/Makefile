# Makefile

ZIP=zip
RM=rm -f
NPM=npm
CURL=curl
AWSCLI=awslocal --no-cli-pager
REGION=ap-northeast-1
SINCE=1h
FUNCTION_NAME=todo-lambda

.PHONY: all update clean test invoke tail

all:

update:
	$(NPM) run prebuild
	$(NPM) run build
	$(NPM) run postbuild
	$(AWSCLI) lambda update-function-code --region $(REGION) --function-name $(FUNCTION_NAME) --zip-file fileb://dist/index.zip

clean:
	-$(RM) -r dist
	-$(RM) url.txt

test:
	$(NPM) run test

invoke: url.txt
	$(CURL) `cat url.txt`

tail:
	$(AWSCLI) logs tail --region $(REGION) --since $(SINCE) /aws/lambda/$(FUNCTION_NAME)

url.txt:
	AWSCLI="$(AWSCLI)" REGION="$(REGION)" ./get_function_url.sh $(FUNCTION_NAME) > url.txt
