package the.closet

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import the.closet.routes.accountRoutes
import the.closet.routes.algorithmRoutes
import the.closet.routes.residencyRoutes
import the.closet.routes.studentRoutes
import the.closet.service.AlgorithmService
import the.closet.service.ResidencyService
import the.closet.service.StudentService
import the.closet.supabase.SupabaseClientProvider

fun Application.configureRouting() {

    val supabase = SupabaseClientProvider.client
    val studentService = StudentService(supabase)
    val residencyService = ResidencyService(supabase)
    val algorithmService = AlgorithmService(supabase)

    routing {
        route("/api/v1") {
            studentRoutes(studentService)
            residencyRoutes(residencyService)
            accountRoutes()
            algorithmRoutes(algorithmService)
        }
    }
}
