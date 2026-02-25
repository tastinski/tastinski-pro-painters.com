CREATE TABLE `contact_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`phone_number` text NOT NULL,
	`email` text NOT NULL,
	`project_type` text,
	`property_address` text,
	`message` text,
	`created_at` text NOT NULL,
	`email_sent` integer DEFAULT false
);
