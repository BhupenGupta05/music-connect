import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      handle: string | null;
    } & DefaultSession['user']
  }
}
