CREATE TABLE "figma_account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"figma_user_id" text NOT NULL,
	"figma_email" text NOT NULL,
	"figma_handle" text,
	"figma_img_url" text,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"access_token_expires_at" timestamp NOT NULL,
	"label" text,
	"is_default" boolean NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "figma_project" (
	"id" text PRIMARY KEY NOT NULL,
	"figma_account_id" text NOT NULL,
	"team_id" text,
	"name" text NOT NULL,
	"file_count" integer,
	"project_type" text,
	"cached_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "figma_team" (
	"id" text PRIMARY KEY NOT NULL,
	"figma_account_id" text NOT NULL,
	"name" text NOT NULL,
	"member_count" integer,
	"permission_level" text,
	"cached_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "figma_account" ADD CONSTRAINT "figma_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figma_project" ADD CONSTRAINT "figma_project_figma_account_id_figma_account_id_fk" FOREIGN KEY ("figma_account_id") REFERENCES "public"."figma_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figma_project" ADD CONSTRAINT "figma_project_team_id_figma_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."figma_team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figma_team" ADD CONSTRAINT "figma_team_figma_account_id_figma_account_id_fk" FOREIGN KEY ("figma_account_id") REFERENCES "public"."figma_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_figma_account_user_id" ON "figma_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_figma_account_figma_user_id" ON "figma_account" USING btree ("figma_user_id");--> statement-breakpoint
CREATE INDEX "idx_figma_project_account_id" ON "figma_project" USING btree ("figma_account_id");--> statement-breakpoint
CREATE INDEX "idx_figma_project_team_id" ON "figma_project" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_figma_team_account_id" ON "figma_team" USING btree ("figma_account_id");