CREATE TABLE "figma_file" (
	"id" text PRIMARY KEY NOT NULL,
	"figma_account_id" text NOT NULL,
	"project_id" text,
	"name" text NOT NULL,
	"thumbnail_url" text,
	"last_modified" timestamp,
	"version" text,
	"cached_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "figma_frame" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"file_id" text NOT NULL,
	"name" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"category" text NOT NULL,
	"matched_device" text,
	"cached_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "figma_page" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"name" text NOT NULL,
	"frame_count" integer,
	"cached_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "figma_file" ADD CONSTRAINT "figma_file_figma_account_id_figma_account_id_fk" FOREIGN KEY ("figma_account_id") REFERENCES "public"."figma_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figma_file" ADD CONSTRAINT "figma_file_project_id_figma_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."figma_project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figma_frame" ADD CONSTRAINT "figma_frame_page_id_figma_page_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."figma_page"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figma_frame" ADD CONSTRAINT "figma_frame_file_id_figma_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."figma_file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figma_page" ADD CONSTRAINT "figma_page_file_id_figma_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."figma_file"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_figma_file_account_id" ON "figma_file" USING btree ("figma_account_id");--> statement-breakpoint
CREATE INDEX "idx_figma_file_project_id" ON "figma_file" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_figma_frame_page_id" ON "figma_frame" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "idx_figma_frame_file_id" ON "figma_frame" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "idx_figma_frame_category" ON "figma_frame" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_figma_page_file_id" ON "figma_page" USING btree ("file_id");