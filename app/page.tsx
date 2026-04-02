import styles from "./page.module.css";
import Link from "next/link"

export default function Home() {
  return (
    <main className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link href='/' className={styles.logo}>music-connect</Link>
        <Link href="/login" className={styles.navLink}>Sign in</Link>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.badge}>now in beta</div>
        <h1 className={styles.h1}>
          Find your people<br />
          <span className={styles.serif}>through music.</span>
        </h1>
        <p className={styles.sub}>
          Connect your Spotify or YouTube. We match you with people
          who share your taste — no names, no location, just music.
        </p>
        <div className={styles.ctas}>
          <Link href="/login" className={styles.ctaPrimary}>Get started free</Link>
          <a href="#how" className={styles.ctaSecondary}>How it works ↓</a>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className={styles.section}>
        <h2 className={styles.h2}>How it works</h2>
        <div className={styles.steps}>
          {[
            { n: "01", title: "Connect your music", body: "Link Spotify or YouTube. We read your top tracks, artists, and playlists." },
            { n: "02", title: "Build your taste profile", body: "We turn your listening history into a music fingerprint — genres, moods, era." },
            { n: "03", title: "Get matched", body: "We find people with compatible taste. No personal details shared — ever." },
            { n: "04", title: "Start a conversation", body: "Chat through our secure space. Share what you want, when you want." },
          ].map((s) => (
            <div key={s.n} className={styles.stepCard}>
              <span className={styles.stepNum}>{s.n}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepBody}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy strip */}
      <section className={styles.privacy}>
        <p className={styles.privacyText}>
          🔒 We never store your name, email, or location.
          Your music taste is all we need.
        </p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerText}>© 2026 music-connect</span>
        <span className={styles.footerText}>privacy-first by design</span>
      </footer>
    </main>
  )
}