/* eslint-disable no-console */
import bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import path from "path";

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME || "pradeeppatel2k26";
  const password = process.env.SEED_ADMIN_PASSWORD || "Mynameis#12";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = {
    username,
    passwordHash,
    role: "admin" as const,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
  };

  const outPath = path.join(process.cwd(), "data", "users.json");
  await writeFile(outPath, JSON.stringify([user], null, 2), "utf-8");

  console.log(`✅ Seeded admin user "${username}" -> ${outPath}`);
  console.log(`   Login with: ${username} / ${password}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
