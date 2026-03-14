ThisBuild / version      := "0.1.0-SNAPSHOT"
ThisBuild / scalaVersion := "2.13.14"
ThisBuild / name         := "KanjiReader"

lazy val root = (project in file("."))
  .settings(
    name                       := "KanjiReader",
    Compile / mainClass        := Some("kanjiReader.MainApp"),
    assembly / mainClass       := Some("kanjiReader.MainApp"),
    assembly / assemblyJarName := "app-assembly.jar",

    assembly / assemblyMergeStrategy := {
      case "rootdoc.txt" => MergeStrategy.discard
      case PathList("META-INF", "maven", xs @ _*) => MergeStrategy.discard
      case PathList("META-INF", "io.netty.versions.properties") => MergeStrategy.first
      case PathList("module-info.class") => MergeStrategy.discard
      case x if x.endsWith("module-info.class") => MergeStrategy.discard
      case "reference.conf" => MergeStrategy.concat
      case "application.conf" => MergeStrategy.concat
      case x =>
        val oldStrategy = (assembly / assemblyMergeStrategy).value
        oldStrategy(x)
    }
  )

libraryDependencies ++= Seq(
  "dev.zio" %% "zio"      % "2.1.23",
  "dev.zio" %% "zio-json" % "0.7.3",
  "dev.zio" %% "zio-http" % "3.7.4",
  "io.getquill"   %% "quill-zio"           % "4.8.5",
  "io.getquill"   %% "quill-jdbc-zio"      % "4.8.5",
  "com.h2database" % "h2"                  % "2.4.240",
  "org.flywaydb" % "flyway-core" % "10.0.0",
  "dev.zio"       %% "zio-config"          % "4.0.6",
  "dev.zio"       %% "zio-config-typesafe" % "4.0.6",
  "dev.zio"       %% "zio-config-magnolia" % "4.0.6",
  "org.slf4j"      % "slf4j-api"           % "2.0.17",
  "ch.qos.logback" % "logback-classic"     % "1.5.22",
  "dev.zio"       %% "zio-cache"           % "0.2.5"
)

ThisBuild / libraryDependencySchemes += "dev.zio" %% "zio-json" % "always"

resolvers ++= Resolver.sonatypeOssRepos("snapshots")

semanticdbEnabled := true
ThisBuild / allowUnsafeScalaLibUpgrade := true
