import type { Account, Session } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";

// Mock @auth/prisma-adapter first
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn().mockReturnValue({}),
}));

// Mock prisma - this creates the mock that will be imported
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  oAuthToken: {
    upsert: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock data
const mockAccount: Account = {
  provider: "google",
  providerAccountId: "google-123",
  access_token: "access-token-abc",
  refresh_token: "refresh-token-xyz",
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  type: "oauth",
  token_type: "bearer",
};

const mockUserNoHandle: AdapterUser = {
  id: "user-001",
  name: "Test User",
  email: "test@gmail.com",
  image: null,
  emailVerified: null,
};

const mockUserWithHandle: AdapterUser = {
  id: "user-002",
  name: "Returning User",
  email: "returning@gmail.com",
  image: null,
  emailVerified: null,
};

// Extended session type
interface ExtendedSession extends Session {
  user: Session['user'] & {
    id: string;
    handle: string | null;
  };
}

const mockSession: ExtendedSession = {
  user: {
    id: "",
    handle: null,
    name: "Test",
    email: "test@gmail.com",
    image: null,
  },
  expires: new Date(Date.now() + 3600 * 1000).toISOString(),
};

// ─────────────────────────────────────────
// SUITE 1 — signIn callback
// ─────────────────────────────────────────
describe("signIn callback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1.1 — allows google provider through", async () => {
    const { default: authOptions } = await import("@/lib/auth");
    const signIn = authOptions.callbacks?.signIn!;

    const result = await signIn({
      user: mockUserNoHandle,
      account: mockAccount,
      profile: undefined,
      credentials: undefined,
      email: undefined,
    });

    expect(result).toBe(true);
  });

  test("1.2 — blocks non-google providers", async () => {
    const { default: authOptions } = await import("@/lib/auth");
    const signIn = authOptions.callbacks?.signIn!;

    const result = await signIn({
      user: mockUserNoHandle,
      account: { ...mockAccount, provider: "github" },
      profile: undefined,
      credentials: undefined,
      email: undefined,
    });

    expect(result).toBe(false);
  });

  test("1.3 — blocks sign in if account is null", async () => {
    const { default: authOptions } = await import("@/lib/auth");
    const signIn = authOptions.callbacks?.signIn!;

    const result = await signIn({
      user: mockUserNoHandle,
      account: null,
      profile: undefined,
      credentials: undefined,
      email: undefined,
    });

    expect(result).toBe(false);
  });
});

// ─────────────────────────────────────────
// SUITE 2 — session callback
// ─────────────────────────────────────────
describe("session callback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.update.mockReset();
  });

  describe("Scenario 1 — first time sign up", () => {
    test("2.1 — session gets user id attached", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ handle: null });

      const { default: authOptions } = await import("@/lib/auth");
      const sessionCallback = authOptions.callbacks?.session!;

      const result = await sessionCallback({
        session: mockSession,
        user: mockUserNoHandle,
        token: {},
        trigger: "update",
        newSession: mockSession,
      });

      expect((result.user as any)?.id).toBe("user-001");
    });

    test("2.2 — new user has null handle in session", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ handle: null });

      const { default: authOptions } = await import("@/lib/auth");
      const sessionCallback = authOptions.callbacks?.session!;

      const result = await sessionCallback({
        session: mockSession,
        user: mockUserNoHandle,
        token: {},
        trigger: "update",
        newSession: mockSession,
      });

      expect((result.user as any)?.handle).toBeNull();
    });
  });

  describe("Scenario 2 — returning user with handle", () => {
    test("2.3 — session has correct handle", async () => {
      // Mock the database lookup to return the user with handle
      mockPrisma.user.findUnique.mockResolvedValue({
        handle: "indievibes99"
      });

      const { default: authOptions } = await import("@/lib/auth");
      const sessionCallback = authOptions.callbacks?.session!;

      const result = await sessionCallback({
        session: mockSession,
        user: mockUserWithHandle,
        token: {},
        trigger: "update",
        newSession: mockSession,
      });

      expect((result.user as any)?.handle).toBe("indievibes99");
    });

    test("2.4 — session has correct user id", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        handle: "indievibes99"
      });

      const { default: authOptions } = await import("@/lib/auth");
      const sessionCallback = authOptions.callbacks?.session!;

      const result = await sessionCallback({
        session: mockSession,
        user: mockUserWithHandle,
        token: {},
        trigger: "update",
        newSession: mockSession,
      });

      expect((result.user as any)?.id).toBe("user-002");
    });
  });

  describe("Scenario 3 — returning user without handle", () => {
    test("2.5 — session handle is null when not set", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ 
        handle: null 
      });

      const { default: authOptions } = await import("@/lib/auth");
      const sessionCallback = authOptions.callbacks?.session!;

      const result = await sessionCallback({
        session: mockSession,
        user: mockUserNoHandle,
        token: {},
        trigger: "update",
        newSession: mockSession,
      });

      expect((result.user as any)?.handle).toBeNull();
    });
  });
});

// ─────────────────────────────────────────
// SUITE 3 — handle API route
// ─────────────────────────────────────────
describe("POST /api/user/handle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.update.mockReset();
  });

  test("3.1 — rejects handle shorter than 3 characters", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-001", handle: null },
    });

    const { POST } = await import("@/app/api/user/handle/route");

    const req = new Request("http://localhost:3000/api/user/handle", {
      method: "POST",
      body: JSON.stringify({ handle: "ab" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Handle too short");
  });

  test("3.2 — rejects already taken handle", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-001", handle: null },
    });

    // Mock that the handle is already taken by another user
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "other-user",
      handle: "takenhandle",
    });

    const { POST } = await import("@/app/api/user/handle/route");

    const req = new Request("http://localhost:3000/api/user/handle", {
      method: "POST",
      body: JSON.stringify({ handle: "takenhandle" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("Handle already taken");
  });

  test("3.3 — accepts valid unique handle", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user-001", handle: null },
    });

    // Mock findUnique for checking if handle exists (returns null for available)
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    // Mock findUnique for checking if user already has a handle (returns null for no handle)
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    // Mock the update
    mockPrisma.user.update.mockResolvedValue({
      id: "user-001",
      handle: "indievibes99",
    });

    const { POST } = await import("@/app/api/user/handle/route");

    const req = new Request("http://localhost:3000/api/user/handle", {
      method: "POST",
      body: JSON.stringify({ handle: "indievibes99" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test("3.4 — rejects if not authenticated", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const { POST } = await import("@/app/api/user/handle/route");

    const req = new Request("http://localhost:3000/api/user/handle", {
      method: "POST",
      body: JSON.stringify({ handle: "validhandle" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });
});