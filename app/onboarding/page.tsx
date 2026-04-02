"use client";

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import styles from "./page.module.css"

export default function OnboardingPage() {
  const { update } = useSession()
  const router = useRouter()
  const [handle, setHandle] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isValid = handle.length >= 3 && /^[a-z0-9_]+$/.test(handle)

  async function submitHandle() {
    if (!isValid) {
      setError("3+ characters, only letters, numbers and underscores")
      return
    }
    setLoading(true)
    setError("")

    const res = await fetch("/api/user/handle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Something went wrong")
      setLoading(false)
      return
    }

    await update()
    router.push("/dashboard")
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.top}>
          <div className={styles.step}>step 1 of 1</div>
          <h1 className={styles.h1}>Pick your alias</h1>
          <p className={styles.sub}>
            This is how others find you. No real name needed —
            just something that feels like you.
          </p>
        </div>

        <div className={styles.inputWrap}>
          <span className={styles.at}>@</span>
          <input
            className={styles.input}
            placeholder="indievibes99"
            value={handle}
            maxLength={24}
            onChange={(e) => {
              setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
              setError("")
            }}
            onKeyDown={(e) => e.key === "Enter" && submitHandle()}
            autoFocus
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {handle.length >= 3 && !error && (
          <p className={styles.hint}>Looks good!</p>
        )}

        <button
          className={styles.btn}
          style={{
            opacity: isValid ? 1 : 0.4,
            cursor: isValid ? "pointer" : "not-allowed",
          }}
          onClick={submitHandle}
          disabled={!isValid || loading}
        >
          {loading ? "Saving..." : "Continue →"}
        </button>

        <p className={styles.rules}>
          Letters, numbers and underscores only · 3–24 characters
        </p>
      </div>
    </main>
  )
}

