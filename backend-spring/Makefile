# Makefile

.PHONY: all image run test clean

GRADLE=./gradlew
DOCKER=docker
TAG=todo:latest
JAR=build/libs/todoapp-0.0.1-SNAPSHOT.jar

all: image

image: $(JAR)
	$(DOCKER) build -t $(TAG) .

run:
	$(DOCKER) run -p8080:8080 $(TAG)

test:
	$(GRADLE) test

clean:
	-$(DOCKER) image rm $(TAG)
	-$(GRADLE) clean

$(JAR):
	$(GRADLE) assemble
