package the.closet.routes

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import io.ktor.server.request.receive
import kotlinx.serialization.json.JsonObject
import the.closet.model.*
import the.closet.model.PostInterviewRankingDTO
import the.closet.service.*
import the.closet.supabase.SupabaseClientProvider
import java.util.UUID


fun Route.residencyRoutes(residencyService: ResidencyService){


    // Create a new company
    post("/company") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@post call.respond(HttpStatusCode.Unauthorized)

        val service = ResidencyService(SupabaseClientProvider.clientWithToken(jwt))

        val dto = call.receive<NewResidencyPartnerDTO>()
        val row = service.create(dto)
        call.respond(HttpStatusCode.Created, row)
    }

    // Get a company by ID
    get("/company/{id}") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val id = call.parameters["id"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing id"))

        val service = ResidencyService(SupabaseClientProvider.clientWithToken(jwt))

        val row = service.getCompany(id)
        if (row == null) {
            call.respond(HttpStatusCode.NotFound, mapOf("error" to "Company not found"))
        } else {
            call.respond(row)
        }
    }

    // Get a company’s joined profile (name + profile) by ID
    get("/company/profile/{id}") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val id = call.parameters["id"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing id"))

        val service = ResidencyService(SupabaseClientProvider.clientWithToken(jwt))

        val row = service.getJoinedProfile(id)
        if (row == null) {
            call.respond(HttpStatusCode.NotFound, mapOf("error" to "Company Profile not found"))
        } else {
            call.respond(row)
        }
    }

    //Get an RPs company id by their userId
    get("/company-by-userid/{id}"){
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val id = call.parameters["id"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing id"))

        val service = ResidencyService(SupabaseClientProvider.clientWithToken(jwt))
        val companyId = service.getCompanyByUser(id)
        call.respond(companyId)
    }

    //New company email by company id
    post("/company/new-email/{id}"){
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@post call.respond(HttpStatusCode.Unauthorized)

        val id = call.parameters["id"]
            ?: return@post call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing id"))

        val service = ResidencyService(SupabaseClientProvider.clientWithToken(jwt))
        val dto = call.receive<NewCompanyEmailDTO>()
        val row = service.newCompanyEmail(dto)

        call.respond(HttpStatusCode.Created, row)
    }

    // List all companies
    get("/companies") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val service = ResidencyService(
            SupabaseClientProvider.clientWithToken(jwt)
        )

        val companies: List<JsonObject> = service.list()
        call.respond(companies)
    }

    get("/job-postings") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val service = ResidencyService(
            SupabaseClientProvider.clientWithToken(jwt)
        )

        try {
            val jobs = service.getJoinedJobPosting()
            call.respond(jobs)
        } catch (e: Exception) {
            call.application.log.error("Fetch job postings failed", e)
            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to (e.message ?: "fetch failed"))
            )
        }
    }

    post("/new-job-posting/{company_id}"){
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@post call.respond(HttpStatusCode.Unauthorized)

        val companyId = call.parameters["company_id"]
            ?: return@post call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing company_id"))

        val service = ResidencyService(SupabaseClientProvider.clientWithToken(jwt))
        try {
            // Use CreateJobPostingDTO for incoming data
            val incoming: CreateJobPostingDTO = call.receive()

            // Convert to NewJobPostingDTO with generated id and company_id
            val jobPostingDTO = NewJobPostingDTO(
                id = UUID.randomUUID().toString(),
                company_id = companyId,
                job_title = incoming.job_title,
                salary = incoming.salary,
                accommodation_support = incoming.accommodation_support,
                description = incoming.description,
                contact_email = incoming.contact_email,
                location = incoming.location,
                position_count = incoming.position_count,
                residency = incoming.residency
            )

            val row = service.createJobPosting(jobPostingDTO)
            call.respond(HttpStatusCode.Created, row)
        } catch (e: Exception) {
            call.application.log.error("Failed to create new job posting", e)
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Creation failed")))
        }
    }

    get("/job-postings/company/{id}") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val companyID = call.parameters["id"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing company ID"))

        val service = ResidencyService(SupabaseClientProvider.clientWithToken(jwt))

        try {
            val jobs = service.getJobPostingsByCompany(companyID)
            call.respond(jobs)
        } catch (e: Exception) {
            call.application.log.error("Fetch job postings failed", e)
            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to (e.message ?: "fetch failed"))
            )
        }
    }

    //Get student IDs of who will be interviewing for each job posting
    get("/job-postings/candidates/{id}"){
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val jobPostingId = call.parameters["id"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing job posting ID"))

        val service = ResidencyService(SupabaseClientProvider.clientWithToken(jwt))
        try {
            val students = service.getCandidatesByJobPosting(jobPostingId)
            call.respond(students)
        } catch (e: Exception) {
            call.application.log.error("Fetch job postings candidates failed", e)
            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to (e.message ?: "fetch failed"))
            )
        }
    }

    get("/company/{id}/candidates") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val companyId = call.parameters["id"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing company ID"))

        val service = ResidencyService(SupabaseClientProvider.clientWithToken(jwt))
        try {
            val candidates = service.getCandidatesWithDetailsByCompany(companyId)
            call.respond(candidates)
        } catch (e: Exception) {
            call.application.log.error("Fetch company candidates failed", e)
            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to (e.message ?: "fetch failed"))
            )
        }
    }

    get("/job-posting/{residency}") {
        val residency = call.parameters["residency"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Residency not present"))

        val res = residencyService.listCompaniesWithPostingsByResidency(residency)
        call.respond(res)
    }

    get("/job-posting/residency/{residency}") {
        val residency = call.parameters["residency"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Residency not present"))

        val res = residencyService.getPostingsByResidency(residency)
        call.respond(res)
    }

    post("/post-interview-rankings"){
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@post call.respond(HttpStatusCode.Unauthorized)

        val service = ResidencyService(SupabaseClientProvider.clientWithToken(jwt))
        try{
            val rankings: List<PostInterviewRankingDTO> = call.receive()
            val rows = service.submitPostInterviewRankings(rankings)
            call.respond(rows)
        } catch (e: Exception) {
            call.application.log.error("Failed to submit post interview rankings", e)
            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to (e.message ?: "fetch failed"))
            )
        }
    }

    get("/student/{id}/interviewed-jobs") {
        val jwt = call.request
            .headers["Authorization"]
            ?.removePrefix("Bearer ")
            ?: return@get call.respond(HttpStatusCode.Unauthorized)

        val studentId = call.parameters["id"]
            ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing student ID"))

        val service = ResidencyService(SupabaseClientProvider.clientWithToken(jwt))

        try {
            val jobs = service.getInterviewedJobsByStudent(studentId)
            call.respond(jobs)
        } catch (e: Exception) {
            call.application.log.error("Fetch interviewed jobs failed", e)
            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("error" to (e.message ?: "fetch failed"))
            )
        }
    }

}