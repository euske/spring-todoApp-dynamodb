# Makefile

.PHONY: all test clean

NPM=npm
RM=rm -f
PLAYWRIGHT=mcr.microsoft.com/playwright:v1.51.1
PORT=5173

all: test

test: test-local

test-local:
	$(NPM) run test

test-docker:
	docker run --rm -v .:/e2e -e CI=$$CI --ipc=host \
		--add-host=host.docker.internal:host-gateway $(PLAYWRIGHT) \
		sh -c 'cd /e2e && npm ci && BASE_URL=http://host.docker.internal:$(PORT)/ npm run test:docker'

clean:
	-$(RM) -r ./playwright-report
	-$(RM) -r ./test-results
