package the.closet.service

import Algorithm
import JobPosting
import ResidencyPartner
import Student
import Students
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import matchStudents
import the.closet.model.InterviewInsert
import the.closet.model.NewJobPostingDTO
import the.closet.model.PostInterviewRankingDTO
import the.closet.supabase.SupabaseClientProvider
import java.util.UUID

@kotlinx.serialization.Serializable
data class FirstStudentRankingDTO(
    val student_id: String,
    val job_posting_id: String,
    val rank: Int
)

@kotlinx.serialization.Serializable
data class FinalMatchedRankingDTO(
    val id: String,
    val student_id: String,
    val job_posting_id: String
)

@kotlinx.serialization.Serializable
data class MatchResult(
    val partner: ResidencyPartner,
    val hires: List<Student>
)



class AlgorithmService(private val supabaseClient: SupabaseClient) {

    val residencyService = ResidencyService(supabaseClient)
    val studentService = StudentService(supabaseClient)

    fun rankingHelperMatch(postInterviewRankingDTO: List<PostInterviewRankingDTO>, type: String): List<String>{
        postInterviewRankingDTO.sortedBy {it.rank}
        if(type.equals("partner")){
            return postInterviewRankingDTO.map { it.student_id }
        }
        return postInterviewRankingDTO.map {it.job_posting_id}
    }

    fun rankingHelper(firstStudentRankingDTO: List<FirstStudentRankingDTO>): List<String>{
        firstStudentRankingDTO.sortedBy { it.rank }
        return firstStudentRankingDTO.map { (it.job_posting_id)  }
    }

    fun postingToCompany(jobPostings: List<NewJobPostingDTO>): HashMap<String, JobPosting>{
        val postings = mutableListOf<JobPosting>()
        val postingMap = hashMapOf<String, JobPosting>()

        jobPostings.forEach { postings.add(JobPosting(it.position_count, it.id)) }
        postings.forEach { postingMap.put(it.id, it) }

        return postingMap
    }

    suspend fun studentBuilder(students: List<StudentWithProfileDTO>): List<Students>{
        val studentList = mutableListOf<Students>()

        for(stu in students){
            val rawRankings = studentService.getStudentRankingsById(stu.id)
            println(rawRankings)
            val rankings = rankingHelper(rawRankings)
            println(rankings)
            studentList.add(Students(
                stu.name,
                stu.student_profile?.qca ?: "0",
                rankings,
                stu.id
            ))
        }
        return studentList
    }


    suspend fun assignInterviews(year: Int, residency: String): Map<Students, List<JobPosting>>{

        val students = studentBuilder(studentService.getAllStudentsWithProfileByYear(year))
        val postingMap = postingToCompany(residencyService.getPostingsByResidency(residency))

        println(students)
        println(postingMap)

        val algo = Algorithm()

        val out: Map<Students, List<JobPosting>> =
            algo.assignByPreferences(
                students,
                postingMap = postingMap
            )

        persistInterviews(out)
        return out;
    }

    private suspend fun persistInterviews(
        assignments: Map<Students, List<JobPosting>>
    ) {
        val rowsToInsert: List<InterviewInsert> = assignments
            .flatMap { (stu, jobList) ->
                jobList.map { job ->
                    InterviewInsert(
                        student_id = stu.id,
                        job_posting_id = job.id
                    )
                }
            }

        val response = supabaseClient.postgrest["interviews"]
            .insert(rowsToInsert)
    }

    suspend fun matchResidency(year: Int, residency: String): List<MatchResult> {
        val students = studentService.listByYear(year)
        val jobPostings = residencyService.getPostingsByResidency(residency)
        val studentList = mutableListOf<Student>()
        val jobList = mutableListOf<ResidencyPartner>()

        for(stu in students){
            val preferences = rankingHelperMatch(
                studentService.getPostInterviewRanking(stu.id,),
                "student"
            )
            studentList.add(
                Student(
                    stu.name,
                    stu.id,
                    preferences
                )
            )
        }

        for(job in jobPostings){
            val rankings = rankingHelperMatch(
                residencyService.getPostInterviewRanking(job.id),
                "partner"
            )
            jobList.add(
                ResidencyPartner(
                    job.job_title,
                    job.id,
                    job.position_count,
                    rankings
                )
            )
        }

        val out: Map<ResidencyPartner, List<Student>> = matchStudents(studentList, jobList)
        finalMatch(out)
        return toMatchResult(out);
    }
    suspend fun finalMatch(out: Map<ResidencyPartner, List<Student>>) {

        val rowsToInsert: List<FinalMatchedRankingDTO> = out.flatMap { (partner, matchedStudents) ->
            matchedStudents.map { student ->
                FinalMatchedRankingDTO(
                    id = UUID.randomUUID().toString(),
                    student_id = student.id,
                    job_posting_id = partner.id
                )
            }
        }

        if (rowsToInsert.isEmpty()) {
            println("No matches to insert.")
            return
        }

        val response = supabaseClient
            .postgrest["final_matched_ranking"]
            .insert(rowsToInsert)

    }
    fun toMatchResult(out: Map<ResidencyPartner, List<Student>>): List<MatchResult> {
        return out.map { (partner, hires) -> MatchResult(partner, hires) }
    }

}
