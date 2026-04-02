"use client";

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import YoutubeIcon from "@/components/ui/icons/YoutubeIcon";
import SpotifyIcon from "@/components/ui/icons/SpotifyIcon";
import next from "next";

type ConnectionStatus = {
    youtube: boolean
    spotify: boolean
}

export default function Connect() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [connections, setConnections] = useState<ConnectionStatus>({ youtube: false, spotify: false });
    const [loading, setLoading] = useState<ConnectionStatus>({ youtube: false, spotify: false });
    const [fetching, setFetching] = useState(true);

    async function checkConnections() {
        try {
            const res = await fetch("/api/user/connections")
            const data = await res.json()
            setConnections(data)
        } catch (error) {
            console.error("Error fetching connections:", error);
        } finally {
            setFetching(false);
        }
    }

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;

        const url = new URL(window.location.href);
        const connected = url.searchParams.get("connected");
        const error = url.searchParams.get("error");

        checkConnections();

        if (error) {
            const messages: Record<string, string> = {
                youtube_denied: "YouTube access was denied.",
                state_expired: "The connection attempt expired. Please try again.",
                session_mismatch: "Session error. Please log in again.",
                token_exchange_failed: "Could not connect YouTube. Please try again.",
            };
            // show a toast or set an error state here
            console.error(messages[error] ?? "Unknown error");
        }

        if (connected || error) {
            window.history.replaceState({}, "", "/connect");
        }
    }, [status])

    async function connectYouTube() {
        setLoading(prev => ({ ...prev, youtube: true }));
        window.location.href = "/api/connect/youtube"; // hits your new route
    }
    async function disconnectYouTube() {
        setLoading(prev => ({ ...prev, youtube: true }));

        await fetch("/api/user/disconnect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ provider: "youtube" }),
        })

        await checkConnections();

        setLoading(prev => ({ ...prev, youtube: false }));
    }

    async function connectSpotify() {

    }

    async function disconnectSpotify() {

    }

    const atleastOneConnected = connections.youtube || connections.spotify;

    if (status === "loading" || fetching) {
        return <div className={styles.loading}>Waking up server...</div>
    }

    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <div className={styles.top}>
                    <div className={styles.step}>step 2 of 2</div>
                    <h1 className={styles.h1}>Connect your music</h1>
                    <p className={styles.sub}>
                        Link your accounts so we can build your taste profile.
                        We only read — never post or modify anything.
                    </p>
                </div>

                <div className={styles.platforms}>
                    {/* YouTube */}
                    <div className={styles.platform}>
                        <div className={styles.platformLeft}>
                            <div className={styles.platformIcon} data-platform="youtube">
                                <YoutubeIcon />
                            </div>
                            <div>
                                <div className={styles.platformName}>YouTube Music</div>
                                <div className={styles.platformDesc}>Liked videos, playlists, history</div>
                            </div>
                        </div>
                        {connections.youtube ? (
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                {/* <span className={styles.pill} data-status="connected">
                                    connected
                                </span> */}

                                <button
                                    className={styles.disconnectBtn}
                                    onClick={disconnectYouTube}
                                    disabled={loading.youtube}
                                >
                                    {loading.youtube ? "Disconnecting..." : "Disconnect"}
                                </button>
                            </div>
                        ) : (
                            <button
                                className={styles.connectBtn}
                                onClick={connectYouTube}
                                disabled={loading.youtube}
                            >
                                {loading.youtube ? "Connecting..." : "Connect"}
                            </button>
                        )}
                    </div>

                    <div className={styles.divider} />

                    {/* Spotify */}
                    <div className={styles.platform}>
                        <div className={styles.platformLeft}>
                            <div className={styles.platformIcon} data-platform="spotify">
                                <SpotifyIcon />
                            </div>
                            <div>
                                <div className={styles.platformName}>Spotify</div>
                                <div className={styles.platformDesc}>Top tracks, artists, playlists</div>
                            </div>
                        </div>
                        {connections.spotify ? (

                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                {/* <span className={styles.pill} data-status="connected">
                                    connected
                                </span> */}

                                <button
                                    className={styles.disconnectBtn}
                                    onClick={disconnectSpotify}
                                    disabled={loading.spotify}
                                >
                                    {loading.spotify ? "Disconnecting..." : "Disconnect"}
                                </button>
                            </div>
                        ) : (
                            <button
                                className={styles.connectBtn}
                                onClick={connectSpotify}
                                disabled={loading.spotify}
                            >
                                {loading.spotify ? "Connecting..." : "Connect"}
                            </button>
                        )}
                    </div>
                </div>

                {atleastOneConnected ? (
                    <button className={styles.btn} onClick={() => router.push("/dashboard")}>
                        Go to dashboard →
                    </button>
                ) : (
                    <button
                        className={styles.btn}
                        style={{ opacity: 0.35, cursor: "not-allowed" }}
                        disabled
                    >
                        Connect at least one platform to continue
                    </button>
                )}

                <p className={styles.privacy}>
                    🔒 Read-only access · No personal data stored · Revoke anytime
                </p>
            </div>
        </main>
    )
}