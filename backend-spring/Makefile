# Makefile

.PHONY: all buildImage runImage test run clean

RM=rm -f
GRADLE=./gradlew
DOCKER=docker
CURL=curl
TAG=todo:latest
JAR=build/libs/todoapp-0.0.1-SNAPSHOT.jar
PORT=8080

all:

buildImage: $(JAR)
	$(DOCKER) build -t $(TAG) .

runImage:
	$(DOCKER) run -p8080:8080 $(TAG)

test:
	$(GRADLE) clean test

run:
	$(GRADLE) bootRun

start:
	PORT=$(PORT) $(GRADLE) bootRun &
	sleep 10
	$(CURL) -o /dev/null --retry-connrefused --retry 5 --retry-delay 10 http://localhost:$(PORT)/

clean:
	-$(DOCKER) image rm $(TAG)
	-$(GRADLE) clean
	-$(RM) -r ./src/main/resources/public

$(JAR):
	$(GRADLE) assemble
