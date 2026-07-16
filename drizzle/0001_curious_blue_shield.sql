ALTER TABLE `designs` ADD `share_id` text;--> statement-breakpoint
ALTER TABLE `designs` ADD `customer_name` text;--> statement-breakpoint
ALTER TABLE `designs` ADD `phone_number` text;--> statement-breakpoint
ALTER TABLE `designs` ADD `share_created_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `designs_share_id_unique` ON `designs` (`share_id`);