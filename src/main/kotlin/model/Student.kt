package the.closet.model

import kotlinx.serialization.Serializable


data class Student(
    val name: String,
    val id: String,
    val studentPref: HashMap<String, List<ResidencyPartner>>
)

@Serializable
data class AcceptedStudentEmails(
    val emails: List<String>
)