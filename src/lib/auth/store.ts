import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { AuthUser } from "@/types/auth";

export type StoredAuthUser = AuthUser & {
  passwordHash: string;
};

type AuthStore = {
  users: StoredAuthUser[];
};

const authDir = path.join(process.cwd(), ".andishi");
const authFile = path.join(authDir, "auth-users.json");

async function readStore(): Promise<AuthStore> {
  try {
    const raw = await readFile(authFile, "utf8");
    const parsed = JSON.parse(raw) as AuthStore;

    return { users: Array.isArray(parsed.users) ? parsed.users : [] };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ENOENT") {
      return { users: [] };
    }

    throw error;
  }
}

async function writeStore(store: AuthStore) {
  await mkdir(authDir, { recursive: true });
  await writeFile(authFile, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function getStoredUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const store = await readStore();

  return store.users.find((user) => user.email.toLowerCase() === normalized) ?? null;
}

export async function getStoredUserById(id: string) {
  const store = await readStore();

  return store.users.find((user) => user.id === id) ?? null;
}

export async function upsertStoredUser(user: StoredAuthUser) {
  const store = await readStore();
  const index = store.users.findIndex(
    (stored) =>
      stored.id === user.id ||
      stored.email.toLowerCase() === user.email.toLowerCase(),
  );

  if (index >= 0) {
    store.users[index] = { ...store.users[index], ...user };
  } else {
    store.users.push(user);
  }

  await writeStore(store);
  return user;
}
