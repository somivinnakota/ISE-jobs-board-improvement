package the.closet.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import the.closet.service.AlgorithmService
import the.closet.service.ResidencyService
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import io.ktor.server.request.receive
import the.closet.service.StudentService

fun Route.algorithmRoutes(algorithmService: AlgorithmService){
    post("/match-interviews/{year}/{residency}"){
        try {

            val year = call.parameters["year"]
                ?: return@post call.respond(HttpStatusCode.BadRequest,
                    mapOf("error" to "Missing year"))

            val residency = call.parameters["residency"]
                ?: return@post call.respond(HttpStatusCode.BadRequest,
                    mapOf("error" to "Missing year"))



            val res = algorithmService.assignInterviews(year.toInt(), residency)
            call.respond(res)
        }catch (e: Exception){
            call.application.log.error("Interview Match", e)

            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to (e.message ?: "Interview Match failed"))
            )
        }
    }

    post("/match-residency/{year}/{residency}"){
        try{
            val year = call.parameters["year"]
                ?: return@post call.respond(HttpStatusCode.BadRequest,
                    mapOf("error" to "Missing year"))

            val residency = call.parameters["residency"]
                ?: return@post call.respond(HttpStatusCode.BadRequest,
                    mapOf("error" to "Missing year"))


            val res = algorithmService.matchResidency(year.toInt(), residency)

            call.respond(res)

        }catch (e: Exception){
            call.application.log.error("Residency Match failed", e)

            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to (e.message ?: "residency match failed"))
            )
        }
    }
}