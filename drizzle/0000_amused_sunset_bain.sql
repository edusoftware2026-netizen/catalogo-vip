CREATE TABLE `booking_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`telegram_user_id` text NOT NULL,
	`telegram_username` text,
	`customer_name` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bot_drafts` (
	`telegram_user_id` text PRIMARY KEY NOT NULL,
	`stage` text NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`zone` text NOT NULL,
	`price` integer NOT NULL,
	`commission` integer NOT NULL,
	`bio` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`photo_key` text,
	`telegram_message_id` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
