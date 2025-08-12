# Makefile

AWSCLI=awslocal
AWS_REGION=ap-northeast-1

DIRS=todo

.PHONY: all deploy test lint clean

all:

deploy:
	for dir in $(DIRS); do cd $$dir && AWSCLI="$(AWSCLI)" AWS_REGION="$(AWS_REGION)" $(MAKE) deploy; done

test:
	for dir in $(DIRS); do cd $$dir && AWSCLI="$(AWSCLI)" AWS_REGION="$(AWS_REGION)" $(MAKE) test; done

lint:
	for dir in $(DIRS); do cd $$dir && AWSCLI="$(AWSCLI)" AWS_REGION="$(AWS_REGION)" $(MAKE) lint; done

clean:
	for dir in $(DIRS); do cd $$dir && AWSCLI="$(AWSCLI)" AWS_REGION="$(AWS_REGION)" $(MAKE) clean; done
	cd terraform && $(MAKE) clean
