# Makefile

.PHONY: all build lint run test clean

NPM=npm
RM=rm -f

all:

build:
	$(NPM) run build

lint:
	$(NPM) run lint

run:
	$(NPM) run dev

test:
	$(NPM) run test

clean:
	-$(RM) -r ./dist
