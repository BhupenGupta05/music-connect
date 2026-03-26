'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitHandle() {
    if (!handle || handle.length < 3) {
      setError("Handle must be at least 3 characters long");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/user/handle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ handle }),
    })

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    await update();
    router.push("/dashboard");
  }



  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Pick your alias</h2>
        <p style={{ color: "#888" }}>
          This is how others will find you — no real name needed
        </p>
        <input
          style={styles.input}
          placeholder="e.g. indievibes99"
          value={handle}
          onChange={(e) => setHandle(e.target.value.toLowerCase())}
        />
        {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}
        <button
          style={styles.button}
          onClick={submitHandle}
          disabled={loading}
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  )
}


const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },
  card: {
    padding: "2rem",
    borderRadius: "10px",
    background: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: 320,
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginTop: "1rem",
    marginBottom: "0.5rem",
    fontSize: 15,
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    border: "none",
    background: "#4285F4",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
  },
};