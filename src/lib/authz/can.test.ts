import { describe, expect, it, vi } from "vitest";

const { resolveActorPermissions } = vi.hoisted(() => ({
  resolveActorPermissions: vi.fn(),
}));

vi.mock("@/lib/authz/resolve", () => ({ resolveActorPermissions }));

import type { SessionContext } from "@/lib/auth/session";
import { authorize, can } from "@/lib/authz/can";
import { ForbiddenError } from "@/lib/authz/errors";

function fakeSession(): SessionContext {
  return {
    token: "t",
    sessionId: "s",
    expiresAt: new Date(),
    user: {
      id: "user-1",
      email: "a@andishi.dev",
      name: "Test Staff",
      role: "admin",
      status: "active",
      createdAt: new Date().toISOString(),
    },
  };
}

describe("can()", () => {
  it("returns true when the permission is in the actor's global grants", async () => {
    resolveActorPermissions.mockResolvedValue({
      userId: "user-1",
      global: new Set(["crm.brief.read"]),
      teamScoped: new Map(),
    });

    expect(await can(fakeSession(), "crm.brief.read")).toBe(true);
  });

  it("returns false when the actor holds no matching permission", async () => {
    resolveActorPermissions.mockResolvedValue({
      userId: "user-1",
      global: new Set(["finance.invoice.read"]),
      teamScoped: new Map(),
    });

    expect(await can(fakeSession(), "crm.brief.read")).toBe(false);
  });

  it("checks team-scoped grants only when the matching teamId is passed", async () => {
    resolveActorPermissions.mockResolvedValue({
      userId: "user-1",
      global: new Set(),
      teamScoped: new Map([["team-a", new Set(["delivery.project.write"])]]),
    });

    expect(await can(fakeSession(), "delivery.project.write", { teamId: "team-a" })).toBe(true);
    expect(await can(fakeSession(), "delivery.project.write", { teamId: "team-b" })).toBe(false);
    expect(await can(fakeSession(), "delivery.project.write")).toBe(false);
  });
});

describe("authorize()", () => {
  it("throws ForbiddenError when the actor lacks the permission", async () => {
    resolveActorPermissions.mockResolvedValue({
      userId: "user-1",
      global: new Set(),
      teamScoped: new Map(),
    });

    await expect(authorize(fakeSession(), "crm.brief.read")).rejects.toThrow(ForbiddenError);
  });

  it("resolves without throwing when the actor holds the permission", async () => {
    resolveActorPermissions.mockResolvedValue({
      userId: "user-1",
      global: new Set(["crm.brief.read"]),
      teamScoped: new Map(),
    });

    await expect(authorize(fakeSession(), "crm.brief.read")).resolves.toBeUndefined();
  });
});
