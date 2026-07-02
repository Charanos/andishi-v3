import { describe, expect, it } from "vitest";
import { DomainValidationError } from "@/lib/authz/errors";
import { assertBalanced, type PostEntryInput } from "@/lib/services/finance/ledger";

describe("assertBalanced()", () => {
  it("accepts a simple balanced debit/credit pair", () => {
    const entries: PostEntryInput[] = [
      { accountCode: "1000", direction: "debit", amountCents: 50_000 },
      { accountCode: "4000", direction: "credit", amountCents: 50_000 },
    ];
    expect(() => assertBalanced(entries)).not.toThrow();
  });

  it("accepts a split transaction where multiple debits sum to one credit", () => {
    const entries: PostEntryInput[] = [
      { accountCode: "5000", direction: "debit", amountCents: 30_000 },
      { accountCode: "5100", direction: "debit", amountCents: 20_000 },
      { accountCode: "2000", direction: "credit", amountCents: 50_000 },
    ];
    expect(() => assertBalanced(entries)).not.toThrow();
  });

  it("rejects a transaction where debits and credits don't match", () => {
    const entries: PostEntryInput[] = [
      { accountCode: "1000", direction: "debit", amountCents: 50_000 },
      { accountCode: "4000", direction: "credit", amountCents: 49_999 },
    ];
    expect(() => assertBalanced(entries)).toThrow(DomainValidationError);
  });

  it("rejects a transaction with fewer than two entries", () => {
    const entries: PostEntryInput[] = [
      { accountCode: "1000", direction: "debit", amountCents: 50_000 },
    ];
    expect(() => assertBalanced(entries)).toThrow(DomainValidationError);
  });

  it("rejects a transaction with only debits (no credit side at all)", () => {
    const entries: PostEntryInput[] = [
      { accountCode: "1000", direction: "debit", amountCents: 25_000 },
      { accountCode: "1010", direction: "debit", amountCents: 25_000 },
    ];
    expect(() => assertBalanced(entries)).toThrow(DomainValidationError);
  });

  it("treats a zero-sum transaction as balanced (both sides zero)", () => {
    const entries: PostEntryInput[] = [
      { accountCode: "1000", direction: "debit", amountCents: 0 },
      { accountCode: "4000", direction: "credit", amountCents: 0 },
    ];
    expect(() => assertBalanced(entries)).not.toThrow();
  });
});
