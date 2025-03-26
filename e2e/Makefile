# Makefile

.PHONY: all test clean

NPM=npm
RM=rm -f

all: test

test:
	$(NPM) run test

clean:
	-$(RM) -r playwright-report
	-$(RM) -r test-results
