package the.closet.service

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonBuilder
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import the.closet.model.PostInterviewRankingDTO

@Serializable
data class NewStudentDTO(
        val name: String,
        val id: String,
        val year: Int
)

@kotlinx.serialization.Serializable
data class StudentDTO(
    val name: String,
    val id: String,
    val student_profile_id: String,
    val year: Int
)

@Serializable
data class StudentProfileDTO(
    val id: String,
    val qca: String? = "",
    val pronouns: String?,
    val description: String?,
    val avatar_url: String?,
    val cv_url: String?,
    val github_link: String?,
    val linkedin_link: String?,
    val personal_site_link: String?
)
@Serializable
data class StudentWithProfileDTO(
    val id: String,
    val name: String,
    val student_profile_id: String,
    val year: Int,
    val student_profile: StudentProfileDTO?
)

@Serializable
data class StudentWithProfileAndEmailDTO(
    val id: String,
    val name: String,
    val student_profile_id: String,
    val year: Int,
    val student_profile: StudentProfileDTO?,
    val accepted_student_emails: List<EmailRow>?
)


@Serializable
data class StudentProfileInput(
        val qca: Double? = null,
        val pronouns: String? = null,
        val description: String? = null,
        val avatar: String? = null
)

@Serializable
data class AccountWrapper(
    val isAdmin: Boolean,
    val user: UserEmail?
)

@Serializable
data class UserEmail(
    val email: String
)

@Serializable
data class AcceptedStudentEmailDTO(
    val email: String
)

@Serializable
data class JobRankingDTO( //Student id is included in the API url
    val job_posting_id: String,
    val rank: Int
)

@Serializable
data class JobRankingsListDTO(
    val rankings: List<JobRankingDTO>
)

@Serializable
data class JobRankingsDTO(
    val studentId: String,
    val rankings: List<JobRankingDTO>
)

@Serializable
data class EmailRow(val email: String)

@Serializable
data class InterviewWithStudentDTO(
    val id: Long,
    val student_id: String,
    val job_posting_id: String,
    val student: StudentStub,
    val job_posting: PostingStub
)

@Serializable
data class PostingStub(
    val id: String,
    val job_title: String,
    val company: CompanyStub
)

@Serializable
data class CompanyStub(
    val company_name: String,
    val company_profile: CompanyProfileStub
)

@Serializable
data class CompanyProfileStub(
    val company_avatar: String
)

@Serializable data class StudentStub(val id: String, val name: String, val year: Int)

@Serializable
data class FinalMatchDTO(
    val id: String,
    val student_id: String,
    val job_posting_id: String,

    val student: StudentDTO,
    val job_posting: JobPostingDTO
)

class StudentService(private val client: SupabaseClient) {

    suspend fun create(dto: NewStudentDTO): JsonObject =
        client.postgrest["student"].insert(dto).decodeSingle()

    suspend fun list(): List<StudentDTO> =
        client.postgrest["student"].select().decodeList<StudentDTO>()

    suspend fun listByYear(year: Int): List<StudentDTO> =
        client.postgrest["student"].select(){filter {  eq("year", year)}}.decodeList<StudentDTO>()

    suspend fun listWithProfiles(year: Int): List<StudentWithProfileAndEmailDTO> =
        client.postgrest["student"]
            .select(
                Columns.raw(
                    """
                id,
                name,
                year,
                student_profile_id,
                student_profile:student_profile (
                  id,
                  qca,
                  pronouns,
                  description,
                  avatar_url,
                  cv_url,
                  github_link,
                  linkedin_link,
                  personal_site_link
                ),
                accepted_student_emails!student_id (
                  email
                )
            """.trimIndent()
                )
            ) {
                filter { eq("year", year) }
            }
            .decodeList<StudentWithProfileAndEmailDTO>()


    suspend fun get(id: String): JsonObject? =
        client.postgrest["student"]
            .select { filter { eq("id", id) } }
            .decodeList<JsonObject>()
            .firstOrNull()

    suspend fun listInterviewsByYear(year: Int): List<InterviewWithStudentDTO> =
        client.postgrest["interviews"]
            .select(
                Columns.raw(
                    """
                id,
                student_id,
                job_posting_id,
                student!inner(id,name,year),
                job_posting!inner(
                  id,
                  job_title,
                  company!inner(
                    company_name:name,
                    company_profile!inner(company_avatar:avatar)
                  )
                )
                """.trimIndent()
                )
            ) {
                filter { eq("student.year", year) }
            }
            .decodeList<InterviewWithStudentDTO>()

    suspend fun listFinalMatchesByYear(year: Int): List<FinalMatchDTO> =
        client.postgrest["final_matched_ranking"]
            .select(
                Columns.raw(
                    """
                id,
                student_id,
                job_posting_id,

                student!inner(
                  id,
                  name,
                  student_profile_id,
                  year
                ),

                job_posting!inner(
                  id,
                  job_title,
                  salary,
                  accommodation_support,
                  contact_email,
                  position_count,
                  description,
                  location,
                  residency,
                  company(
                    id,
                    name
                  )
                )
                """.trimIndent()
                )
            ) {
                filter { eq("student.year", year) }
            }
            .decodeList<FinalMatchDTO>()

    suspend fun getProfile(id: String): JsonObject? =
        client.postgrest["student_profile"]
            .select { filter { eq("id", id) } }
            .decodeList<JsonObject>()
            .firstOrNull()

    suspend fun getJoinedProfile(id: String): JsonObject? =
        client.postgrest["student"]
            .select(columns = Columns.raw("*, student_profile:student_profile_id(*)")) {
                filter { eq("id", id) }
            }
            .decodeSingle<JsonObject>()

    suspend fun getAllStudentsWithProfile(): List<StudentWithProfileDTO> {
        return client.postgrest["student"]
            .select( Columns.raw("*, student_profile(*)") )
            .decodeList<StudentWithProfileDTO>()
    }

    suspend fun getAllStudentsWithProfileByYear(year: Int): List<StudentWithProfileDTO> {
        return client.postgrest["student"]
            .select( Columns.raw("*, student_profile(*)") ) {
                filter {
                    eq("year", year)
                }
            }
            .decodeList<StudentWithProfileDTO>()
    }

    suspend fun getStudentRankingsById(id: String): List<FirstStudentRankingDTO> {
        return client.postgrest["first_student_ranking"]
            .select(Columns.raw("*")) {
                filter {
                    eq("student_id", id)
                }
            }
            .decodeList()
    }

    suspend fun getPostInterviewRanking(
        studentId: String
    ): List<PostInterviewRankingDTO>{
        return client.postgrest["post_interview_ranking"]
            .select(Columns.raw("*")) {
                filter {
                    eq("student_id", studentId)
                    eq("type", "student")
                }
            }
            .decodeList<PostInterviewRankingDTO>()
    }
    suspend fun addAcceptedStudentEmail(dto: AcceptedStudentEmailDTO): JsonObject =
        client.postgrest["accepted_student_emails"]
            .insert(dto) { select() }
            .decodeSingle()

    suspend fun submitJobRanking(dto: JobRankingDTO): JsonObject =
        client.postgrest["first_student_ranking"]
            .insert(dto) { select() }
            .decodeSingle()

    suspend fun submitJobRankings(studentID: String, rankings: List<JobRankingDTO>): List<JsonObject> {
        val rows: List<JsonObject> = rankings.map { ranking ->
            buildJsonObject {
                put("student_id", JsonPrimitive(studentID)) //JsonPrimitive coverts from string or int -> json
                put("job_posting_id", JsonPrimitive(ranking.job_posting_id))
                put("rank", JsonPrimitive(ranking.rank))
            }
        }

        return client.postgrest["first_student_ranking"]
            .insert(rows) { select() }
            .decodeList()
        }

}
