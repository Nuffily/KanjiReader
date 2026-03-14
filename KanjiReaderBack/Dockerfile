FROM sbtscala/scala-sbt:eclipse-temurin-jammy-17.0.5_8_1.8.2_2.13.10 AS build
WORKDIR /app
COPY . .
RUN sbt clean assembly

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/scala-2.13/app-assembly.jar app.jar

EXPOSE 8099

ENTRYPOINT ["java", "-jar", "app.jar"]