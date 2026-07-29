import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { StoredUser } from "@/types/user";

const DATA_PATH = path.join(process.cwd(), "data", "users.json");

async function ensureDataFile(): Promise<void> {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  try {
    await readFile(DATA_PATH, "utf-8");
  } catch {
    await writeFile(DATA_PATH, "[]", "utf-8");
  }
}

export async function readAllUsers(): Promise<StoredUser[]> {
  await ensureDataFile();
  const raw = await readFile(DATA_PATH, "utf-8");
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

export async function writeAllUsers(users: StoredUser[]): Promise<void> {
  await ensureDataFile();
  await writeFile(DATA_PATH, JSON.stringify(users, null, 2), "utf-8");
}

export async function findUserByUsername(username: string): Promise<StoredUser | undefined> {
  const users = await readAllUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export async function updateUser(username: string, patch: Partial<StoredUser>): Promise<void> {
  const users = await readAllUsers();
  const idx = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return;
  users[idx] = { ...users[idx], ...patch };
  await writeAllUsers(users);
}
