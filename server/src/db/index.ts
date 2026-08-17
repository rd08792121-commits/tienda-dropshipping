import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { env } from "../env.js";

function openDatabase(path: string) {
  if (path !== ":memory:") {
    const dir = dirname(path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
  const database = new Database(path);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  return database;
}

export function createDb(path: string = env.DATABASE_PATH) {
  const database = openDatabase(path);
  const schemaPath = new URL("./schema.sql", import.meta.url);
  const schema = readFileSync(schemaPath, "utf-8");
  database.exec(schema);
  return database;
}

export const db = createDb();
export type Db = ReturnType<typeof createDb>;
