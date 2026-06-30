'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Refresca los datos del servidor cada `seconds` mientras esté montado.
 *  Se usa solo cuando hay partidos en vivo, para no recargar de gusto. */
export default function LiveRefresher({ seconds = 25 }: { seconds?: number }) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000)
    return () => clearInterval(id)
  }, [router, seconds])
  return null
}
