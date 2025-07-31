# Makefile

ZIP=zip
RM=rm -f
MKDIR=mkdir
NPM=npm
CURL=curl
AWSCLI=awslocal

REGION=ap-northeast-1
FUNCTION_NAME=todo-lambda
SINCE=1h

.PHONY: all deploy build test lint clean invoke tail

all:

deploy: clean dist/index.zip
	$(AWSCLI) --no-cli-pager lambda update-function-code --region $(REGION) --function-name $(FUNCTION_NAME) --zip-file fileb://dist/index.zip

dist/index.zip: build
	-$(MKDIR) dist
	cd dist && $(ZIP) -r index.zip index.js*

build:
	$(NPM) run build

test:
	$(NPM) run test

lint:
	$(NPM) run lint

clean:
	-$(RM) -r dist

invoke:
	AWSCLI="$(AWSCLI)" REGION="$(REGION)" ./invoke.sh $(FUNCTION_NAME)

tail:
	$(AWSCLI) --no-cli-pager logs tail --region $(REGION) --since $(SINCE) /aws/lambda/$(FUNCTION_NAME)
