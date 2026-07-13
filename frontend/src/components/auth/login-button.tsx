'use client'

import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LoginButton() {
  const router = useRouter()

  const logout = async () => {
    router.push('/auth/login')
  }

  return <Button onClick={logout}>Login</Button>
}
