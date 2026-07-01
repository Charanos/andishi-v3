import { describe, expect, it } from "vitest";
import { computeProjectHealth } from "@/lib/services/delivery/health";

/**
 * computeProjectHealth accepts an injectable executor, so these tests build
 * a minimal fake matching the exact query shape it calls (two independent
 * `.select().from().where()` calls run via Promise.all - order matches
 * call order, not resolution order, so this fake is safe) instead of
 * mocking the whole @/db module.
 */
function fakeExecutor(
  taskRows: { status: string; dueDate: string | null }[],
  milestoneRows: { status: string; dueDate: string | null }[],
) {
  const results = [taskRows, milestoneRows];
  let call = 0;

  return {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(results[call++]),
      }),
    }),
  } as never;
}

const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
const TOMORROW = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

describe("computeProjectHealth()", () => {
  it("returns off_track when any task is blocked", async () => {
    const health = await computeProjectHealth(
      "p1",
      fakeExecutor([{ status: "blocked", dueDate: null }], []),
    );
    expect(health).toBe("off_track");
  });

  it("returns off_track when an unapproved milestone is overdue", async () => {
    const health = await computeProjectHealth(
      "p1",
      fakeExecutor([], [{ status: "submitted", dueDate: YESTERDAY }]),
    );
    expect(health).toBe("off_track");
  });

  it("does not flag an approved milestone as overdue", async () => {
    const health = await computeProjectHealth(
      "p1",
      fakeExecutor([], [{ status: "approved", dueDate: YESTERDAY }]),
    );
    expect(health).toBe("on_track");
  });

  it("returns at_risk when an incomplete task is due today or overdue", async () => {
    const health = await computeProjectHealth(
      "p1",
      fakeExecutor([{ status: "in_progress", dueDate: TODAY }], []),
    );
    expect(health).toBe("at_risk");
  });

  it("does not flag a done task as overdue", async () => {
    const health = await computeProjectHealth(
      "p1",
      fakeExecutor([{ status: "done", dueDate: YESTERDAY }], []),
    );
    expect(health).toBe("on_track");
  });

  it("returns on_track when nothing is blocked or overdue", async () => {
    const health = await computeProjectHealth(
      "p1",
      fakeExecutor(
        [{ status: "in_progress", dueDate: TOMORROW }],
        [{ status: "pending", dueDate: TOMORROW }],
      ),
    );
    expect(health).toBe("on_track");
  });
});
