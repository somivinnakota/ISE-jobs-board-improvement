package the.closet

import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureDatabases()
    configureHTTP()
    configureSecurity()
    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = true
                ignoreUnknownKeys = true
                allowStructuredMapKeys = true
                coerceInputValues = true
            }
        )
    }
    configureRouting()
}
