"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "./page.module.css";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";
import Link from "next/link"

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const hasHandle = !!(session?.user as any)?.handle
      router.replace(hasHandle ? "/dashboard" : "/onboarding")
    }
  }, [status, session, router])

  if (status === "loading") return <div className={styles.loading}>Loading...</div>

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.back}>← music-connect</Link>

      <div className={styles.card}>
        <div className={styles.top}>
          <h1 className={styles.h1}>Welcome back</h1>
          <p className={styles.sub}>Sign in to find your musical match</p>
        </div>

        <button
          className={styles.googleBtn}
          onClick={async () => {
            setLoading(true)
            await signIn("google")
          }}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <GoogleIcon />
          )}
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <p className={styles.privacy}>
          We never store your name, email, or location.
          <br />Only your music taste — nothing else.
        </p>
      </div>
    </main>
  )
}

