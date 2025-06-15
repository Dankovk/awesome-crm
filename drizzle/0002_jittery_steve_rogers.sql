ALTER TABLE "User" ADD COLUMN "githubId" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "githubToken" text;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_githubId_unique" UNIQUE("githubId");