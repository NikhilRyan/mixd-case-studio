CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`purpose` text NOT NULL,
	`original_name` text NOT NULL,
	`content_type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_object_key_unique` ON `assets` (`object_key`);--> statement-breakpoint
CREATE INDEX `assets_purpose_idx` ON `assets` (`purpose`);--> statement-breakpoint
CREATE TABLE `designs` (
	`id` text PRIMARY KEY NOT NULL,
	`production_ref` text NOT NULL,
	`device_id` text NOT NULL,
	`color_id` text NOT NULL,
	`finish_id` text NOT NULL,
	`spec_json` text NOT NULL,
	`print_asset_key` text NOT NULL,
	`status` text DEFAULT 'locked' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `designs_production_ref_unique` ON `designs` (`production_ref`);--> statement-breakpoint
CREATE INDEX `designs_created_at_idx` ON `designs` (`created_at`);