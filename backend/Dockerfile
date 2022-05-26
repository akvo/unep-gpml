FROM openjdk:11.0-jre-slim-buster

WORKDIR /app

COPY target/lib/ lib/

COPY target/app.jar app.jar

CMD java -Djava.awt.headless=true \
    -XshowSettings:vm \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=70.0 \
    -server \
    -jar app.jar :duct/migrator && \
    java -Djava.awt.headless=true \
    -XshowSettings:vm \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=70.0 \
    -server \
    -jar app.jar :duct/daemon
