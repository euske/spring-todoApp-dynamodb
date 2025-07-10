# Makefile

.PHONY: all buildImage runImage test run clean

GRADLE=./gradlew
DOCKER=docker
TAG=todo:latest
JAR=build/libs/todoapp-0.0.1-SNAPSHOT.jar

all:

buildImage: $(JAR)
	$(DOCKER) build -t $(TAG) .

runImage:
	$(DOCKER) run -p8080:8080 $(TAG)

test:
	$(GRADLE) clean test

run:
	$(GRADLE) bootRun

clean:
	-$(DOCKER) image rm $(TAG)
	-$(GRADLE) clean

$(JAR):
	$(GRADLE) assemble
