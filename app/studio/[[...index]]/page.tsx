'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'

const NextStudio = dynamic(() => import('next-sanity/studio').then((mod) => mod.NextStudio), {
  ssr: false,
})

export default function StudioPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading' || !session) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const config = require('../../../sanity.config').default

  return <NextStudio config={config} />
}
