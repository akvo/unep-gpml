FROM eclipse-temurin:21.0.2_13-jre-jammy

WORKDIR /app

COPY target/uberjar/app.jar app.jar

CMD java \
    -Dclojure.compiler.direct-linking=true \
    -Dclojure.main.report=stderr \
    -XX:-OmitStackTraceInFastThrow \
    -Djava.awt.headless=true \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=70.0 \
    -server \
    -cp app.jar \
    clojure.main -m gpml.main :duct/migrator && \
    java \
    -Dclojure.compiler.direct-linking=true \
    -Dclojure.main.report=stderr \
    -XX:-OmitStackTraceInFastThrow \
    -Djava.awt.headless=true \
    -XX:+UnlockExperimentalVMOptions \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=70.0 \
    -server \
    -cp app.jar \
    clojure.main -m gpml.main :duct/daemon
