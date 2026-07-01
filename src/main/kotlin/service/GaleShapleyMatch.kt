@kotlinx.serialization.Serializable
data class Student(
    val name: String,
    val id: String,
    val prefs: List<String>
)

@kotlinx.serialization.Serializable
data class ResidencyPartner(
    val name: String,
    val id: String,
    val positions: Int,
    val prefs: List<String>
)


fun matchStudents(
    students: List<Student>,
    partners: List<ResidencyPartner>
): Map<ResidencyPartner, List<Student>> {


    val studentById = HashMap<String, Student>()
    for (s in students) studentById[s.id] = s

    val partnerById = HashMap<String, ResidencyPartner>()
    for (p in partners) partnerById[p.id] = p

    val rank = HashMap<String, MutableMap<String, Int>>()   // partner-id ➜ (student-id ➜ rank)
    for (p in partners) {
        val table = HashMap<String, Int>()
        for ((idx, sid) in p.prefs.withIndex()) table[sid] = idx
        rank[p.id] = table
    }


    val free = ArrayDeque<String>()                         // queue of free student-ids
    for (s in students) free.addLast(s.id)

    val next = HashMap<String, Int>()                       // student-id ➜ next pref index
    for (s in students) next[s.id] = 0

    val roster = HashMap<String, MutableList<String>>()     // partner-id ➜ hired student-ids
    for (p in partners) roster[p.id] = mutableListOf()

    fun partnerPrefers(pid: String, a: String, b: String): Boolean {
        val tbl = rank[pid] ?: return false
        val ra = tbl[a] ?: Int.MAX_VALUE
        val rb = tbl[b] ?: Int.MAX_VALUE
        return ra < rb
    }


    while (free.isNotEmpty()) {
        val sid = free.removeFirst()
        val sObj = studentById[sid]!!
        val prefs = sObj.prefs

        if (next[sid]!! >= prefs.size) continue             // exhausted list

        val pid = prefs[next[sid]!!]
        next[sid] = next[sid]!! + 1

        // auto-reject if partner never ranked this student
        val rankTable = rank[pid]
        if (rankTable == null || !rankTable.containsKey(sid)) {
            if (next[sid]!! < prefs.size) free.addLast(sid)
            continue
        }

        val seats = roster[pid]!!
        val cap   = partnerById[pid]!!.positions

        if (seats.size < cap) {
            seats.add(sid)                                  // open seat
        } else {
            // find worst-ranked current hire
            var worst = seats[0]
            var worstRank = rankTable[worst]!!
            for (candidate in seats) {
                val r = rankTable[candidate]!!
                if (r > worstRank) { worst = candidate; worstRank = r }
            }
            if (partnerPrefers(pid, sid, worst)) {
                seats.remove(worst)
                seats.add(sid)
                if (next[worst]!! < studentById[worst]!!.prefs.size)
                    free.addLast(worst)
            } else {
                if (next[sid]!! < prefs.size) free.addLast(sid)
            }
        }
    }


    val result = HashMap<ResidencyPartner, List<Student>>()
    for (p in partners) {
        val hires = mutableListOf<Student>()
        for (id in roster[p.id]!!) hires.add(studentById[id]!!)
        result[p] = hires
    }
    return result
}
