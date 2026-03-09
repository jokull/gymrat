CREATE TABLE `User` (
	`id` text PRIMARY KEY DEFAULT (uuid()) NOT NULL,
	`apiKey` text NOT NULL,
	`email` text NOT NULL,
	`displayEmail` text NOT NULL,
	`hashedPassword` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Workout` (
	`id` text PRIMARY KEY DEFAULT (uuid()) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`description` text NOT NULL,
	`value` text NOT NULL,
	`numberValue` integer DEFAULT 0 NOT NULL,
	`isTime` integer DEFAULT 0 NOT NULL,
	`date` integer NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);