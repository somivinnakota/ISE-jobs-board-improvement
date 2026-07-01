package the.closet.service

import JobPosting
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*
import the.closet.model.*

@kotlinx.serialization.Serializable
data class JobPostingDTO(
    val id: String,
    val job_title: String,
    val salary: Long?,
    val accommodation_support: Boolean?,
    val description: String?,
    val contact_email: String?,
    val location: String?,
    val position_count: Int?,
    val residency: String
)

@kotlinx.serialization.Serializable
data class CompanyWithPostingsDTO(
    val id: String,
    val name: String?,
    val job_posting: List<JobPostingDTO>
)

//@kotlinx.serialization.Serializable
//data class PostInterviewRankingDTO(
//    val type: String,
//    val student_id: String,
//    val job_posting_id: String,
//    val rank: Int
//)

@kotlinx.serialization.Serializable
data class PostInterviewRankingsList(
    val rankings: List<PostInterviewRankingDTO>
)

class ResidencyService(private val supabaseClient: SupabaseClient) {
    suspend fun create(dto: NewResidencyPartnerDTO): JsonObject =
        supabaseClient.postgrest["company"]
        .insert(dto) {
            select()
        }.decodeSingle()

    suspend fun getCompany(id: String): JsonObject? =
        supabaseClient.postgrest["company"]
            .select { filter { eq("id", id) } }
            .decodeList<JsonObject>()
            .firstOrNull()

    suspend fun getCompanyByUser(userId: String): JsonObject =
        supabaseClient.postgrest["account"]
            .select(Columns.raw("company_id"))
            { filter { eq("id", userId) } }
            .decodeSingle<JsonObject>()


    suspend fun getProfile(id: String): JsonObject? =
        supabaseClient.postgrest["company_profile"]
            .select { filter { eq("id", id) } }
            .decodeList<JsonObject>()
            .firstOrNull()

    suspend fun getJoinedProfile(id: String): JsonObject? =
        supabaseClient.postgrest["company"]
            .select(columns = Columns.raw("*, company_profile(*)")) {
                filter { eq("id", id) }
            }
            .decodeSingle<JsonObject>()

    suspend fun list(): List<JsonObject> = supabaseClient.postgrest["company"].select().decodeList()

    suspend fun getJoinedJobPosting(): List<JsonObject> {
        val columns = Columns.raw("*, company(*, company_profile(*))")

        return supabaseClient.postgrest["job_posting"]
            .select(columns)
            .decodeList<JsonObject>()
    }

    suspend fun createCompanyWithProfile(dto: NewCompanyDTO): JsonObject {
        val profile = supabaseClient.postgrest["company_profile"]
            .insert(dto.profile){
                select()
            }
            .decodeSingle<JsonObject>()
        val profileId = profile["id"]!!.jsonPrimitive.content

        val companyPayload = mapOf(
            "name" to dto.name,
            "company_profile" to profileId
        )
        return supabaseClient.postgrest["company"]
            .insert(companyPayload){
                select()
            }
            .decodeSingle()
    }

    suspend fun createJobPosting(dto: NewJobPostingDTO): JsonObject {
       return supabaseClient.postgrest["job_posting"]
           .insert(dto) {
               select()
           }
           .decodeSingle()
    }

    suspend fun getJobPostings(): List<NewJobPostingDTO>{
       return supabaseClient.postgrest["job_posting"]
            .select(Columns.raw("*"))
            .decodeList<NewJobPostingDTO>()
    }

    suspend fun getPostInterviewRanking(
        jobPostingId: String
        ): List<PostInterviewRankingDTO>{
        return supabaseClient.postgrest["post_interview_ranking"]
            .select(Columns.raw("*")) {
                filter {
                    eq("job_posting_id",jobPostingId )
                    eq("type", "partner")
                }
            }
            .decodeList<PostInterviewRankingDTO>()
    }
    suspend fun newCompanyEmail(dto: NewCompanyEmailDTO) {
        return supabaseClient.postgrest["accepted_company_emails"]
            .insert(dto) {
                select()
            }
            .decodeSingle()
    }

    suspend fun getJobPostingsByCompany(companyID: String): List<JsonObject> {
        val columns = Columns.raw("*, company(*, company_profile(*))".trimIndent())
        return supabaseClient.postgrest["job_posting"]
            .select(columns) { filter { eq("company_id", companyID) } }
            .decodeList<JsonObject>()
    }

    //Gets students that will be interviewing for a job
    suspend fun getCandidatesByJobPosting(jobPostingId: String): List<JsonObject> {
        val columns = Columns.raw("student_id")
        return supabaseClient.postgrest["interviews"]
            .select(columns) { filter { eq("job_posting_id", jobPostingId) } }
            .decodeList<JsonObject>()
    }


    suspend fun getCandidatesWithDetailsByCompany(companyId: String): List<CandidateWithDetailsDTO> {
        val query = """
            student_id,
            job_posting_id,
            job_posting!inner(job_title),
            student!inner(name, student_profile(avatar_url))
        """.trimIndent()

        val interviews = supabaseClient.postgrest["interviews"]
            .select(Columns.raw(query)) {
                filter { eq("job_posting.company_id", companyId) }
            }
            .decodeList<InterviewResult>()

        val studentIds = interviews.map { it.student_id }

        val studentEmails = supabaseClient.postgrest["accepted_student_emails"]
            .select(Columns.raw("student_id, email")) {
                filter { isIn("student_id", studentIds) }
            }
            .decodeList<StudentEmail>()
            .associateBy { it.student_id }

        return interviews.map { interview ->
            CandidateWithDetailsDTO(
                student_id = interview.student_id,
                student_name = interview.student.name,
                email = studentEmails[interview.student_id]?.email ?: "",
                job_posting_id = interview.job_posting_id,
                job_title = interview.job_posting.job_title,
                avatar_url = interview.student.student_profile.avatar_url
            )
        }
    }
    suspend fun listCompaniesWithPostingsByResidency(
        residency: String
    ): List<CompanyWithPostingsDTO> =
        supabaseClient.postgrest["company"]
            .select(
                Columns.raw(
                    """
                id,
                name,
                job_posting!inner (
                    id,
                    job_title,
                    salary,
                    accommodation_support,
                    description,
                    contact_email,
                    location,
                    position_count,
                    residency
                )
                """.trimIndent()
                )
            ) {
                filter { eq("job_posting.residency", residency) }
            }
            .decodeList<CompanyWithPostingsDTO>()

    suspend fun submitPostInterviewRankings(rankings: List<PostInterviewRankingDTO>): List<JsonObject> {
        val rows: List<JsonObject> = rankings.map { ranking ->
            buildJsonObject {
                put("type", JsonPrimitive(ranking.type))
                put("student_id", JsonPrimitive(ranking.student_id))
                put("job_posting_id", JsonPrimitive(ranking.job_posting_id))
                put("rank", JsonPrimitive(ranking.rank))
            }
        }

        return supabaseClient.postgrest["post_interview_ranking"]
            .insert(rows) {
                select(Columns.raw("*"))
            }
            .decodeList<JsonObject>()
    }

    suspend fun getInterviewedJobsByStudent(studentId: String): List<JsonObject> {
        val columns = Columns.raw("""
        job_posting!inner(
            id,
            job_title,
            salary,
            accommodation_support,
            position_count,
            location,
            residency,
            company!inner(
                name,
                company_profile(avatar)
            )
        )
    """.trimIndent())

        return supabaseClient.postgrest["interviews"]
            .select(columns) {
                filter {
                    eq("student_id", studentId)
                }
            }
            .decodeList<JsonObject>()
            .map { row ->
                row["job_posting"] as JsonObject
            }
    }

    suspend fun getPostingsByResidency(
        residency: String
    ): List<NewJobPostingDTO> =
        supabaseClient.postgrest["job_posting"]
            .select(
                Columns.raw("*")
            ) {
                filter { eq("residency", residency) }
            }
            .decodeList<NewJobPostingDTO>()
}