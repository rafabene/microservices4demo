# Hello Microservices

To run in `Development mode` execute:

    mvn quarkus:dev


To generate a `native Linux binary` to be used inside `Linux containers (aka docker)` execute:

    mvn package -Pnative -Dnative-image.docker-build=true

