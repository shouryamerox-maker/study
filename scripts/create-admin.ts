/**
 * Creates (or promotes) the first administrator. Teachers are then invited from the
 * Teacher portal → Settings, so nobody can self-register as staff.
 *
 *   npm run create-admin -- --email you@example.com --name "Your Name"
 *   (password is read from ADMIN_PASSWORD or prompted)
 */
import { createInterface } from "node:readline/promises";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { emailSchema, nameSchema, passwordSchema } from "../src/lib/validation";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = emailSchema.parse(arg("email"));
  const name = nameSchema.parse(arg("name") ?? "Administrator");
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question("Password (min 8 chars, letters and numbers): ");
    rl.close();
  }
  passwordSchema.parse(password);

  const db = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.upsert({
      where: { email },
      create: { email, name, passwordHash, role: "ADMIN" },
      update: { role: "ADMIN", passwordHash, status: "ACTIVE" },
    });
    console.log(`Admin ready: ${user.email}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
