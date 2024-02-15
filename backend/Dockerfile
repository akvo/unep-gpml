FROM openjdk:11.0-jre-slim-buster

WORKDIR /app

COPY target/uberjar/app.jar app.jar

CMD java \
    -Dclojure.compiler.direct-linking=true \
    -Djava.awt.headless=true \
    -XshowSettings:vm \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=70.0 \
    -server \
    -cp app.jar \
    gpml.main :duct/migrator && \
    java \
    -Dclojure.compiler.direct-linking=true \
    -Djava.awt.headless=true \
    -XshowSettings:vm \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=70.0 \
    -server \
    -cp app.jar \
    gpml.main :duct/daemon
