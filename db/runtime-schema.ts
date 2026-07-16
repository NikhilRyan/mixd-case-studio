import { env } from "cloudflare:workers";

let schemaReady: Promise<void> | null = null;

async function initializeSchema() {
  if (!env.DB) throw new Error("D1 binding `DB` is unavailable.");

  await env.DB.batch([
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY NOT NULL,
        object_key TEXT NOT NULL UNIQUE,
        purpose TEXT NOT NULL,
        original_name TEXT NOT NULL,
        content_type TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS designs (
        id TEXT PRIMARY KEY NOT NULL,
        submission_id TEXT,
        production_ref TEXT NOT NULL UNIQUE,
        device_id TEXT NOT NULL,
        color_id TEXT NOT NULL,
        finish_id TEXT NOT NULL,
        share_id TEXT,
        customer_name TEXT,
        phone_number TEXT,
        share_created_at TEXT,
        spec_json TEXT NOT NULL,
        print_asset_key TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'locked',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS assets_purpose_idx ON assets (purpose)"),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS assets_object_key_unique ON assets (object_key)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS designs_created_at_idx ON designs (created_at)"),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS designs_production_ref_unique ON designs (production_ref)"),
  ]);

  const tableInfo = await env.DB.prepare("PRAGMA table_info(designs)").all<{ name: string }>();
  const existingColumns = new Set(tableInfo.results.map((column) => column.name));
  const additiveColumns: D1PreparedStatement[] = [];
  if (!existingColumns.has("submission_id")) additiveColumns.push(env.DB.prepare("ALTER TABLE designs ADD COLUMN submission_id TEXT"));
  if (!existingColumns.has("share_id")) additiveColumns.push(env.DB.prepare("ALTER TABLE designs ADD COLUMN share_id TEXT"));
  if (!existingColumns.has("customer_name")) additiveColumns.push(env.DB.prepare("ALTER TABLE designs ADD COLUMN customer_name TEXT"));
  if (!existingColumns.has("phone_number")) additiveColumns.push(env.DB.prepare("ALTER TABLE designs ADD COLUMN phone_number TEXT"));
  if (!existingColumns.has("share_created_at")) additiveColumns.push(env.DB.prepare("ALTER TABLE designs ADD COLUMN share_created_at TEXT"));
  if (additiveColumns.length) await env.DB.batch(additiveColumns);

  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS designs_submission_id_unique ON designs (submission_id)").run();
  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS designs_share_id_unique ON designs (share_id)").run();
}

export function ensureRuntimeSchema() {
  schemaReady ??= initializeSchema().catch((error) => {
    schemaReady = null;
    throw error;
  });
  return schemaReady;
}
