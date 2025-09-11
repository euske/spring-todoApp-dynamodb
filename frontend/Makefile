# Makefile

.PHONY: all build lint run test clean

NPM=npm
RM=rm -f
CP=cp

all:

ci:
	$(NPM) ci

build: ci
	$(NPM) run build

install: build
	-$(RM) -r ../backend-spring/src/main/resources/public/dist
	$(CP) -a ./dist ../backend-spring/src/main/resources/public

lint: ci
	$(NPM) run lint

run: ci
	$(NPM) run dev

test: ci
	$(NPM) run test

clean:
	-$(RM) -r ./dist
