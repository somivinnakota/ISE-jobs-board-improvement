// src/main/kotlin/the/closet/supabase/SupabaseClientProvider.kt
package the.closet.supabase

import io.github.cdimascio.dotenv.dotenv
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.user.UserSession
import kotlinx.datetime.Clock
import kotlin.time.Duration.Companion.seconds

object SupabaseClientProvider {
   private val env = dotenv()

init {
    println("Working directory: " + System.getProperty("user.dir"))
    println("SUPABASE_URL = " + env["SUPABASE_URL"])
    println("SUPABASE_ANON_KEY exists = " + (env["SUPABASE_ANON_KEY"] != null))
}

private val supabaseUrl = env["SUPABASE_URL"] ?: error("SUPABASE_URL not found")
private val anonKey = env["SUPABASE_ANON_KEY"] ?: error("SUPABASE_ANON_KEY not found")

    /**
     *  Public client: sends only
     *  • `apikey: <anonKey>`
     *  (no user JWT)
     */
    val client: SupabaseClient by lazy {
        createSupabaseClient(
            supabaseUrl = supabaseUrl,
            supabaseKey = anonKey
        ) {
            install(Postgrest)
        }
    }

    /**
     * Builds a SupabaseClient that sends on every request:
     *  • `apikey: <anonKey>`
     *  • `Authorization: Bearer <jwt>`
     *
     * This lets your RLS policy (auth.uid()) kick in.
     */
    suspend fun clientWithToken(jwt: String): SupabaseClient {
        val c = createSupabaseClient(
            supabaseUrl = supabaseUrl,
            supabaseKey = anonKey
        ) {
            install(Postgrest)
            install(Auth)
        }

        // Construct a minimal UserSession using their access token
        c.auth.importSession(
            UserSession(
                accessToken         = jwt,
                refreshToken        = "",      // not used here
                expiresIn           = 3600L,   // any positive number
                tokenType           = "Bearer",
                user                = null,    // not needed for RLS
                providerRefreshToken= null,
                providerToken       = null,
                type                = "",
                expiresAt           = Clock.System.now() + 3600.seconds
            )
        )

        return c
    }
}
