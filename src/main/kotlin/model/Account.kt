package the.closet.model

import kotlinx.serialization.Serializable
import kotlinx.datetime.Instant

@Serializable
data class Account(
    val id: String?,
    val company_id: String?,
    val student_id: String?,
    val isAdmin: Boolean,
    val created_at: Instant,
)
