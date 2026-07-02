import { describe, expect, it } from "vitest";
import { computeDaysSalesOutstanding, computeMarginCents } from "@/lib/services/finance/reports";

describe("computeMarginCents()", () => {
  it("computes a positive margin when revenue exceeds cost", () => {
    expect(computeMarginCents(100_000, 60_000)).toBe(40_000);
  });

  it("computes a negative margin when cost exceeds revenue", () => {
    expect(computeMarginCents(30_000, 50_000)).toBe(-20_000);
  });

  it("computes zero margin when revenue equals cost", () => {
    expect(computeMarginCents(75_000, 75_000)).toBe(0);
  });

  it("handles zero revenue and zero cost", () => {
    expect(computeMarginCents(0, 0)).toBe(0);
  });
});

describe("computeDaysSalesOutstanding()", () => {
  it("computes DSO for a standard 30-day period", () => {
    // $10,000 AR against $20,000 revenue over 30 days -> 15 days sales outstanding
    expect(computeDaysSalesOutstanding(10_000_00, 20_000_00, 30)).toBe(15);
  });

  it("returns 0 when revenue is zero (avoids divide-by-zero)", () => {
    expect(computeDaysSalesOutstanding(10_000_00, 0, 30)).toBe(0);
  });

  it("returns 0 when revenue is negative (defensive, should never happen)", () => {
    expect(computeDaysSalesOutstanding(10_000_00, -5_000_00, 30)).toBe(0);
  });

  it("returns 0 DSO when there is no outstanding AR", () => {
    expect(computeDaysSalesOutstanding(0, 20_000_00, 30)).toBe(0);
  });

  it("rounds to one decimal place", () => {
    // 1/3 * 30 = 10 exactly; use a ratio that produces a repeating decimal
    expect(computeDaysSalesOutstanding(1, 3, 30)).toBe(10);
    expect(computeDaysSalesOutstanding(1, 7, 30)).toBeCloseTo(4.3, 1);
  });
});
