
@kotlinx.serialization.Serializable
data class Students(
    val name: String,
    val qca: String,
    val preferences: List<String>,
    val id: String
)

@kotlinx.serialization.Serializable
data class JobPosting(
    val positions: Int,
    val id: String
) {
    var slotsRemaining = positions * INTERVIEWS_PER_POSITION
        private set

    fun takeSlot() {
        require(slotsRemaining > 0) { "$id has no slots left!" }
        slotsRemaining--
    }

    companion object {
        const val INTERVIEWS_PER_POSITION = 3
    }
}

class Algorithm {
    fun assignByPreferences(
        students: List<Students>,
        interviewsPerStudent: Int = 3,
        postingMap: HashMap<String, JobPosting>
    ): Map<Students, List<JobPosting>> {
        // 1) students with the highest QCA are ranked first to ensure they get preferences
        val sorted = students

            /*
        * the results are shuffled for fairness, E.g - two students share a QCA
        * */
            .shuffled()
            .sortedByDescending { it.qca }

        val assignments = mutableMapOf<Students, MutableList<JobPosting>>()

        /* 2) for each student
        create a map of their assignments
        check their preferences
        if there is a slot remaining take it
     */
        for (stu in sorted) {
            assignments[stu] = mutableListOf()
            for (wish in stu.preferences) {
                val posting = postingMap.get(wish)
                if (posting == null) {
                    break;
                }
                if (assignments[stu]!!.size == interviewsPerStudent) break
                if (posting.slotsRemaining > 0) {
                    posting.takeSlot()
                    assignments[stu]!!.add(posting)
                }
            }
            if (assignments[stu]!!.size < interviewsPerStudent) {
                println(
                    "Ran out of preferred slots for ${stu.name}! " +
                            "Either extend their list or add more positions."
                )
            }
        }

        return assignments
    }
}
