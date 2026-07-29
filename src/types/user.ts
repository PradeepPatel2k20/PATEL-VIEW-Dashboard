export interface StoredUser {
  username: string;
  passwordHash: string;
  role: "admin";
  createdAt: string;
  lastLoginAt: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
}
