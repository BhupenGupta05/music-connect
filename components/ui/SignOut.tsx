'use client';

import { Button } from "./button"
import { signOut } from 'next-auth/react'
import styles from "@/app/dashboard/page.module.css"

export default function SignOut() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={styles.btn}>
      Sign out
    </Button>
  )
}