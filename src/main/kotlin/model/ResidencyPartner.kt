package the.closet.model

import java.util.HashMap
import kotlinx.serialization.Serializable

data class ResidencyPartner(
    val name: String,
    val id: String,
    val positions: Int,
    val rpPref: HashMap<String, List<Student>>
)

@Serializable
data class InterviewResult(
    val student_id: String,
    val job_posting_id: String,
    val job_posting: JobPostingData,
    val student: StudentData
)

@Serializable
data class JobPostingData(val job_title: String)

@Serializable
data class StudentData(
    val name: String,
    val student_profile: StudentProfileData
)

@Serializable
data class StudentProfileData(val avatar_url: String)

@Serializable
data class StudentEmail(val student_id: String, val email: String)

@Serializable
data class CandidateWithDetailsDTO(
    val student_id: String,
    val student_name: String,
    val email: String,
    val job_posting_id: String,
    val job_title: String,
    val avatar_url: String
)

@Serializable
data class NewResidencyPartnerDTO(
    val name: String
)

@Serializable
data class NewCompanyProfileDTO(
    val subtitle: String,
    val avatar: String,
    val banner_image: String,
    val description: String,
)

@Serializable
data class NewCompanyDTO(
    val name: String,
    val profile: NewCompanyProfileDTO
)

@Serializable
data class InterviewInsert(
    val student_id: String,
    val job_posting_id: String
)


@Serializable
data class PostInterviewRankingDTO(
    val student_id: String,
    val job_posting_id: String,
    val rank: Int,
    val type: String
)

@Serializable
data class NewJobPostingDTO(
    val id: String,
    val company_id: String,
    val job_title: String,
    val salary: Int,
    val accommodation_support: Boolean,
    val description: String,
    val contact_email: String,
    val location: String,
    val position_count: Int,
    val residency: String
)

@Serializable
data class CreateJobPostingDTO(
    val job_title: String,
    val salary: Int,
    val accommodation_support: Boolean,
    val description: String,
    val contact_email: String,
    val location: String,
    val position_count: Int,
    val residency: String
)

@Serializable
data class NewCompanyEmailDTO(
    val company: String,
    val email: String
)
