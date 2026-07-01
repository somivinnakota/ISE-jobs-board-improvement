package the.closet.service

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.serialization.json.JsonObject

class AccountService(private val client: SupabaseClient) {
    suspend fun getAccount(id: String): JsonObject? =
        client.postgrest["account"]
            .select { filter { eq("id", id) } }
            .decodeList<JsonObject>()
            .firstOrNull()
}
