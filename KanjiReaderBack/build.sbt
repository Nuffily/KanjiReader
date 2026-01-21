ThisBuild / version      := "0.1.0-SNAPSHOT"
ThisBuild / scalaVersion := "2.13.14"
ThisBuild / name         := "KanjiReader"

lazy val root = (project in file("."))
  .settings(
    name := "KanjiReader"
  )

libraryDependencies ++= Seq(
  "dev.zio"       %% "zio"                 % "2.1.23",
  "dev.zio"       %% "zio-json"            % "0.7.3",
  "dev.zio"       %% "zio-http"            % "3.7.4",
//  "dev.zio" %% "zio-http-client" % "3.7.4",
  "io.getquill"   %% "quill-zio"           % "4.8.5",
  "io.getquill"   %% "quill-jdbc-zio"      % "4.8.5",
  "com.h2database" % "h2"                  % "2.4.240",
  "dev.zio"       %% "zio-config"          % "4.0.6",
  "dev.zio"       %% "zio-config-typesafe" % "4.0.6",
  "dev.zio"       %% "zio-config-magnolia" % "4.0.6",
  "org.slf4j"      % "slf4j-api"           % "2.0.17",
  "ch.qos.logback" % "logback-classic"     % "1.5.22",
  "dev.zio" %% "zio-cache" % "0.2.5"
)

ThisBuild / libraryDependencySchemes += "dev.zio" %% "zio-json" % "always"

resolvers ++= Resolver.sonatypeOssRepos("snapshots")
semanticdbEnabled := true
