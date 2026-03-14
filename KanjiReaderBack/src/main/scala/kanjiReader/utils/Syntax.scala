package kanjiReader.utils

import zio.ZIO;

object Syntax {
  implicit class ZioLogOps[R, E, A](val effect: ZIO[R, E, A]) extends AnyVal {
    def logInfo(msg: String): ZIO[R, E, A] = effect.tap(_ => ZIO.logInfo(msg))
  }
}
