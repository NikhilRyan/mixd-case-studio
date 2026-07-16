ALTER TABLE `designs` ADD `submission_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `designs_submission_id_unique` ON `designs` (`submission_id`);