package routes

import io.ktor.client.request.*
import io.ktor.server.testing.*
import kotlin.test.Test

class StudentRoutesKtTest {

    @Test
    fun testGetApiV1StudentsProfileId() = testApplication {
        application {
            TODO("Add the Ktor module for the test")
        }
        client.get("/api/v1/students/profile/{id}").apply {
            TODO("Please write your test here")
        }
    }
}