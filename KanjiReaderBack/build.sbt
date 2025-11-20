ThisBuild / version      := "0.1.0-SNAPSHOT"
ThisBuild / scalaVersion := "2.13.14"
ThisBuild / name         := "KanjiReader"

lazy val root = (project in file("."))
  .settings(
    name := "KanjiReader"
  )

libraryDependencies ++= Seq(
  "dev.zio"       %% "zio"                 % "2.0.21",
  "dev.zio"       %% "zio-json"            % "0.6.2",
  "dev.zio"       %% "zio-http"            % "3.0.0",
  "io.getquill"   %% "quill-zio"           % "4.7.0",
  "io.getquill"   %% "quill-jdbc-zio"      % "4.7.0",
  "com.h2database" % "h2"                  % "2.2.224",
  "dev.zio"       %% "zio-config"          % "4.0.0-RC16",
  "dev.zio"       %% "zio-config-typesafe" % "4.0.0-RC16",
  "dev.zio"       %% "zio-config-magnolia" % "4.0.0-RC16",
  "org.slf4j"      % "slf4j-api"           % "2.0.7",
  "ch.qos.logback" % "logback-classic"     % "1.4.11"
)


resolvers ++= Resolver.sonatypeOssRepos("snapshots")
semanticdbEnabled := true
