'use client';

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from "next/navigation";
import { useEffect } from 'react';

export default function Page() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status == "authenticated") {
            const hasHandle = !!session?.user?.handle;

            router.push(hasHandle ? "/dashboard" : "/onboarding");
        }
    }, [session, router, status]);

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>music-connect</h2>
                <p style={{ color: "#888", marginBottom: "1rem" }}>
                    Connect through music
                </p>
                <button
                    style={styles.button}
                    onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
                >
                    Continue with Google
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
    },
    button: {
        marginTop: "1rem",
        padding: "0.75rem 1.5rem",
        borderRadius: "6px",
        border: "none",
        background: "#4285F4",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
    },
};