FROM openjdk:11.0-jre-slim-buster

WORKDIR /app

COPY target/lib/ lib/

COPY target/app.jar app.jar

CMD ["java", "-jar", "app.jar"]
