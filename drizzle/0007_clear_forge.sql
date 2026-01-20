CREATE TABLE "github_account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"github_user_id" text NOT NULL,
	"github_username" text NOT NULL,
	"github_email" text,
	"github_avatar_url" text,
	"github_name" text,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"scopes" text,
	"label" text,
	"is_default" boolean NOT NULL,
	"status" text NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_export" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"github_account_id" text NOT NULL,
	"repository_owner" text NOT NULL,
	"repository_name" text NOT NULL,
	"repository_url" text NOT NULL,
	"is_new_repository" boolean NOT NULL,
	"branch_name" text NOT NULL,
	"commit_sha" text,
	"commit_message" text NOT NULL,
	"pull_request_url" text,
	"pull_request_number" integer,
	"pull_request_title" text,
	"component_name" text NOT NULL,
	"files_exported" integer NOT NULL,
	"total_size_bytes" integer,
	"conversion_history_id" text,
	"status" text NOT NULL,
	"error_message" text,
	"created_at" timestamp NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "github_account" ADD CONSTRAINT "github_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_export" ADD CONSTRAINT "github_export_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_export" ADD CONSTRAINT "github_export_github_account_id_github_account_id_fk" FOREIGN KEY ("github_account_id") REFERENCES "public"."github_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_export" ADD CONSTRAINT "github_export_conversion_history_id_conversion_history_id_fk" FOREIGN KEY ("conversion_history_id") REFERENCES "public"."conversion_history"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_github_account_user_id" ON "github_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_github_account_github_user_id" ON "github_account" USING btree ("github_user_id");--> statement-breakpoint
CREATE INDEX "idx_github_export_user_id" ON "github_export" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_github_export_github_account_id" ON "github_export" USING btree ("github_account_id");--> statement-breakpoint
CREATE INDEX "idx_github_export_repository" ON "github_export" USING btree ("repository_owner","repository_name");--> statement-breakpoint
CREATE INDEX "idx_github_export_status" ON "github_export" USING btree ("status");