package the.closet.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import kotlinx.serialization.json.JsonObject
import the.closet.model.AcceptedStudentEmails
import the.closet.service.*
import the.closet.supabase.SupabaseClientProvider

fun Route.studentRoutes(studentService: StudentService) {

    // Create a new student
    post("/students") {

        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@post call.respond(HttpStatusCode.Unauthorized)

        val service = StudentService(SupabaseClientProvider.clientWithToken(jwt))

        val dto = call.receive<NewStudentDTO>()
        val row = service.create(dto)
        call.respond(HttpStatusCode.Created, row)
    }

    // List all students
    get("/students") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val service = StudentService(SupabaseClientProvider.clientWithToken(jwt))
        val rows = service.list()
        call.respond(rows)
    }

    // Get a single student by ID
    get("/students/{id}") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val id = call.parameters["id"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing id"))

        val service = StudentService(SupabaseClientProvider.clientWithToken(jwt))
        val row = service.get(id)
        if (row == null) {
            call.respond(HttpStatusCode.NotFound, mapOf("error" to "Student not found"))
        } else {
            call.respond(row)
        }
    }

    // Get a student's joined profile
    get("/students/profile/{id}") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val id = call.parameters["id"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing id"))

        val service = StudentService(SupabaseClientProvider.clientWithToken(jwt))
        val row = service.getJoinedProfile(id)
        if (row == null) {
            call.respond(HttpStatusCode.NotFound, mapOf("error" to "Student not found"))
        } else {
            call.respond(row)
        }
    }

    // Accept a student emails
    post("/accepted-student-emails") {

        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@post call.respond(HttpStatusCode.Unauthorized)

        val service = StudentService(SupabaseClientProvider.clientWithToken(jwt))

        val dto = call.receive<AcceptedStudentEmails>()
        val emails = dto.emails

        if (emails.isEmpty()) {
            return@post call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to "The emails list cannot be empty.")
            )
        }

        val results = emails.map { email ->

            val singleDto = AcceptedStudentEmailDTO(email)
            try {
                val row = service.addAcceptedStudentEmail(singleDto)
                mapOf(
                    "email" to email,
                    "status" to "created",
                )
            } catch (e: Exception) {
                mapOf(
                    "email" to email,
                    "status" to "error",
                    "message" to (e.message ?: "Unknown error")
                )
            }
        }

        call.respond(HttpStatusCode.Created, mapOf("results" to results))
    }

    post("/pre-interview-rankings/{studentId}") {
        val jwt = call.request.headers["Authorization"]?.removePrefix("Bearer ")
            ?: return@post call.respond(HttpStatusCode.Unauthorized)

        val studentIdFromPath = call.parameters["studentId"]
            ?: return@post call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing student ID"))

        val service = StudentService(SupabaseClientProvider.clientWithToken(jwt))
        val dto = call.receive<JobRankingsListDTO>()
        val list: List<JobRankingDTO> = dto.rankings

        if (dto.rankings.isEmpty()) {
            return@post call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to "The rankings list cannot be empty.")
            )
        }

        //Pass id and ranking list into submitJobRankings
        val insertedRows = service.submitJobRankings(studentIdFromPath, list)
        return@post call.respond(HttpStatusCode.Created, insertedRows)
    }


    get("/students-with-profile/{year}") {
        println("Running student with profile")
        val yearParam = call.parameters["year"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing year")

        println("calling list ")
        val list = studentService.listWithProfiles(yearParam.toInt())
        println(list)
        call.respond(list)
    }

    get("/interviews/{year}"){
        val yearParam = call.parameters["year"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing year")

        val list = studentService.listInterviewsByYear(yearParam.toInt())
        call.respond(list)
    }

    get("/final-match/{year}"){
        val yearParam = call.parameters["year"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing year")

        val list = studentService.listFinalMatchesByYear(yearParam.toInt())
        call.respond(list)
    }
}