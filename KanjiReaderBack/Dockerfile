FROM sbtscala/scala-sbt:eclipse-temurin-jammy-17.0.10_7_1.9.9_2.13.12 AS build
WORKDIR /app
COPY project project
COPY build.sbt .
RUN sbt update
COPY src src
RUN sbt clean assembly

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN useradd -ms /bin/bash scalauser

COPY --from=build /app/target/scala-2.13/*assembly.jar app.jar

RUN chown -R scalauser:scalauser /app

USER scalauser

ENV JAVA_OPTS="-Xmx512m -Xms256m"
EXPOSE 8099

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]