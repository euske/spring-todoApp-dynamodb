# Makefile

.PHONY: all build lint run test clean

NPM=npm
RM=rm -f
CP=cp

all:

ci:
	$(NPM) ci

build:
	$(NPM) run build

install: build
	-$(RM) -r ../backend-spring/src/main/resources/public/dist
	$(CP) -a ./dist ../backend-spring/src/main/resources/public

lint:
	$(NPM) run lint

run:
	$(NPM) run dev

test:
	$(NPM) run test

clean:
	-$(RM) -r ./dist
