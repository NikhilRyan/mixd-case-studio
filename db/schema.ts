import { sql } from "drizzle-orm";
import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const assets = sqliteTable(
  "assets",
  {
    id: text("id").primaryKey(),
    objectKey: text("object_key").notNull().unique(),
    purpose: text("purpose", { enum: ["source", "print"] }).notNull(),
    originalName: text("original_name").notNull(),
    contentType: text("content_type").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("assets_purpose_idx").on(table.purpose)],
);

export const designs = sqliteTable(
  "designs",
  {
    id: text("id").primaryKey(),
    submissionId: text("submission_id"),
    productionRef: text("production_ref").notNull().unique(),
    deviceId: text("device_id").notNull(),
    colorId: text("color_id").notNull(),
    finishId: text("finish_id").notNull(),
    shareId: text("share_id"),
    customerName: text("customer_name"),
    phoneNumber: text("phone_number"),
    shareCreatedAt: text("share_created_at"),
    specJson: text("spec_json").notNull(),
    printAssetKey: text("print_asset_key").notNull(),
    status: text("status", { enum: ["locked", "printing", "fulfilled"] }).notNull().default("locked"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("designs_created_at_idx").on(table.createdAt),
    uniqueIndex("designs_submission_id_unique").on(table.submissionId),
    uniqueIndex("designs_share_id_unique").on(table.shareId),
  ],
);
