//package kanjiReader.other
//
//import zio._
//import zio.http._
//import zio.json._
//
//object implicits {
//
//  implicit class ClientExpectOps(private val client: Client) extends AnyVal {
//
//    /** * Выполняет запрос, проверяет HTTP-статус и декодирует тело в тип T.
//     * Scope используется локально для безопасного управления ресурсами ответа.
//     */
//    def expect[T](req: Request)(
//      implicit decoder: JsonDecoder[T]
//    ): ZIO[Any, Throwable, T] = // <--- СИГНАТУРА БЕЗ & Scope!
//
//      // client.request возвращает эффект, требующий Scope.
//      // Мы оборачиваем его в ZIO.scoped, чтобы предоставить Scope локально.
//      ZIO.scoped {
//        client.request(req).flatMap { response =>
//          // 1. Чтение тела ответа как строка
//          response.body.asString.flatMap { bodyString =>
//
//            // 2. Обработка ошибок HTTP-статуса
//            if (response.status.isError) {
//              ZIO.fail(new RuntimeException(s"HTTP Error ${response.status.code}: $bodyString"))
//            } else {
//              // 3. Декодирование JSON
//              ZIO.fromEither(bodyString.fromJson[T]).mapError { error =>
//                new RuntimeException(s"Decoding error: $error. Body: $bodyString")
//              }
//            }
//          }
//        }
//      }
//  }
//
//}