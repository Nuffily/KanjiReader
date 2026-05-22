package kanjiReader.utils.cache

import zio.UIO

trait Cache[K, V] {

  def put(key: K, value: V): UIO[Unit]

  def get(key: K): UIO[Option[V]]

//  def getOrElseZIO[R, E](key: K)(compute: ZIO[R, E, V]): ZIO[R, E, V]
//
//  def remove(key: K): UIO[Unit]
//
//  def size: UIO[Int]
//
//  def clear: UIO[Unit]
}