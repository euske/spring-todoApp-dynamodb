# Makefile

.PHONY: all test clean

NPM=npm
RM=rm -f
PLAYWRIGHT=mcr.microsoft.com/playwright:v1.51.1

all: test

test: test-local

test-local:
	$(NPM) run test

test-docker:
	docker run -it --rm -v .:/e2e --ipc=host $(PLAYWRIGHT) \
		sh -c 'cd /e2e && BASE_URL=http://host.docker.internal:5173/ npm run test'

clean:
	-$(RM) -r ./playwright-report
	-$(RM) -r ./test-results
