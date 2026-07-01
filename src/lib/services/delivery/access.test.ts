import { describe, expect, it, vi } from "vitest";

const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("@/db", () => ({ getDb }));

import type { SessionContext } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/authz/errors";
import { resolveProjectAccess } from "@/lib/services/delivery/access";

function mockProjectLookup(project: unknown) {
  getDb.mockReturnValue({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(project ? [project] : []),
        }),
      }),
    }),
  });
}

function fakeSession(overrides: Partial<SessionContext["user"]>): SessionContext {
  return {
    token: "t",
    sessionId: "s",
    expiresAt: new Date(),
    user: {
      id: "user-1",
      email: "a@andishi.dev",
      name: "Test",
      role: "admin",
      status: "active",
      createdAt: new Date().toISOString(),
      ...overrides,
    },
  };
}

describe("resolveProjectAccess()", () => {
  it("throws NotFoundError when the project does not exist", async () => {
    mockProjectLookup(null);
    await expect(
      resolveProjectAccess({ session: fakeSession({ role: "admin" }), requestId: "r" }, "missing"),
    ).rejects.toThrow(NotFoundError);
  });

  it("gives staff scope without checking ownership", async () => {
    mockProjectLookup({ id: "p1", organizationId: "org-x", engineerIds: [] });
    const result = await resolveProjectAccess(
      { session: fakeSession({ role: "admin" }), requestId: "r" },
      "p1",
    );
    expect(result.scope).toBe("staff");
  });

  it("gives a client read-only scope only for their own organization's project", async () => {
    mockProjectLookup({ id: "p1", organizationId: "org-x", engineerIds: [] });

    await expect(
      resolveProjectAccess(
        { session: fakeSession({ role: "client", organizationId: "org-x" }), requestId: "r" },
        "p1",
      ),
    ).resolves.toMatchObject({ scope: "client-read-only" });

    await expect(
      resolveProjectAccess(
        { session: fakeSession({ role: "client", organizationId: "org-y" }), requestId: "r" },
        "p1",
      ),
    ).rejects.toThrow(NotFoundError);
  });

  it("gives a developer scope only when they're assigned to the project", async () => {
    mockProjectLookup({ id: "p1", organizationId: "org-x", engineerIds: ["eng-1"] });

    await expect(
      resolveProjectAccess(
        { session: fakeSession({ role: "developer", engineerId: "eng-1" }), requestId: "r" },
        "p1",
      ),
    ).resolves.toMatchObject({ scope: "developer" });

    await expect(
      resolveProjectAccess(
        { session: fakeSession({ role: "developer", engineerId: "eng-2" }), requestId: "r" },
        "p1",
      ),
    ).rejects.toThrow(NotFoundError);
  });
});
