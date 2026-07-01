package the.closet.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import kotlinx.serialization.json.*
import the.closet.model.Account
import the.closet.service.AccountService
import the.closet.supabase.SupabaseClientProvider


fun Route.accountRoutes() {
    get("/account/role/{id}") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val id = call.parameters["id"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing id"))

        val service = AccountService(
            SupabaseClientProvider.clientWithToken(jwt)
        )

        val rowJson = service.getAccount(id)
        val account = rowJson?.let { Json.decodeFromJsonElement<Account>(it) }

        when {
            account == null -> call.respond(HttpStatusCode.NotFound, mapOf("error" to "Account not found"))
            account.isAdmin == true -> call.respond(buildJsonObject { put("role", "admin") })
            account.company_id != null -> call.respond(buildJsonObject { put("role", "company") })
            account.student_id != null -> call.respond(buildJsonObject { put("role", "student") })
            else -> call.respond(HttpStatusCode.NotFound, mapOf("error" to "No role found"))
        }
    }
}