import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import authOptions from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import SignOut from "@/components/ui/SignOut"
import styles from "./page.module.css"
import { Platform } from "@prisma/client"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  })

  const handle = user?.handle

  const connections = await prisma.connection.findMany({
    where: {
      userId: session.user.id,
      active: true
    }
  })

  const allProviders = Object.values(Platform).map(p => p.toLowerCase());
  // const connectedProviders = connections.map(c => c.provider.toLowerCase());

  // const allConnected = allProviders.every(p => connectedProviders.includes(p));

  const hasProfile = connections.length > 0; 
  
  const hasAllConnections = allProviders.every(p => connections.some(c => c.provider.toLowerCase() === p));

  return (
    <main className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>music-connect</Link>
        <div className={styles.navRight}>
          <span className={styles.handleBadge}>@{handle}</span>
          <SignOut />
        </div>
      </nav>

      <div className={styles.content}>
        {/* Welcome */}
        <div className={styles.welcome}>
          <h1 className={styles.h1}>Hey, <span className={styles.serif}>@{handle}</span></h1>
          <p className={styles.sub}>Here's your music-connect home base.</p>
        </div>

        {/* Status cards */}
        <div className={styles.grid}>
          {/* Music profile card */}
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardTitle}>Music profile</span>
              <span className={`${styles.pill} ${hasProfile ? styles.pillSuccess : styles.pillWarning}`}>
                {hasProfile ? "connected" : "not connected"}
              </span>
            </div>
            <p className={styles.cardBody}>
              {hasProfile
                ? "Your taste profile is built and ready for matching."
                : "Connect Spotify or YouTube to build your taste profile."}
            </p>
            {!hasAllConnections && (
              <Link href="/connect" className={styles.cardBtn}>
                Connect music →
              </Link>
            )}
          </div>

          {/* Matches card */}
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardTitle}>Your matches</span>
              <span className={`${styles.pill} ${styles.pillMuted}`}>coming soon</span>
            </div>
            <p className={styles.cardBody}>
              Once your music profile is ready, we'll find people who match your vibe.
            </p>
          </div>

          {/* Privacy card */}
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardTitle}>Your privacy</span>
              <span className={`${styles.pill} ${styles.pillSuccess}`}>protected</span>
            </div>
            <p className={styles.cardBody}>
              Your real name, email, and location are never stored or shared with other users.
            </p>
          </div>
        </div>

        {/* Anonymous ID strip */}
        <div className={styles.idStrip}>
          <span className={styles.idLabel}>Your anonymous ID</span>
          <code className={styles.idCode}>{session.user.id}</code>
        </div>
      </div>
    </main>
  )
}