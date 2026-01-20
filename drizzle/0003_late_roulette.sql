CREATE TABLE "figma_export" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"figma_account_id" text NOT NULL,
	"file_key" text NOT NULL,
	"node_id" text NOT NULL,
	"node_name" text NOT NULL,
	"format" text NOT NULL,
	"scale" integer NOT NULL,
	"quality" integer,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"storage_key" text NOT NULL,
	"file_size_bytes" integer,
	"status" text NOT NULL,
	"error_message" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "figma_export_set" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"figma_account_id" text NOT NULL,
	"file_key" text NOT NULL,
	"node_id" text NOT NULL,
	"node_name" text NOT NULL,
	"format" text NOT NULL,
	"includes_srcset" boolean NOT NULL,
	"srcset_markup" text,
	"status" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "figma_export" ADD CONSTRAINT "figma_export_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figma_export" ADD CONSTRAINT "figma_export_figma_account_id_figma_account_id_fk" FOREIGN KEY ("figma_account_id") REFERENCES "public"."figma_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figma_export_set" ADD CONSTRAINT "figma_export_set_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figma_export_set" ADD CONSTRAINT "figma_export_set_figma_account_id_figma_account_id_fk" FOREIGN KEY ("figma_account_id") REFERENCES "public"."figma_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_figma_export_user_id" ON "figma_export" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_figma_export_figma_account_id" ON "figma_export" USING btree ("figma_account_id");--> statement-breakpoint
CREATE INDEX "idx_figma_export_file_key" ON "figma_export" USING btree ("file_key");--> statement-breakpoint
CREATE INDEX "idx_figma_export_node_id" ON "figma_export" USING btree ("node_id");--> statement-breakpoint
CREATE INDEX "idx_figma_export_status" ON "figma_export" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_figma_export_set_user_id" ON "figma_export_set" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_figma_export_set_node_id" ON "figma_export_set" USING btree ("node_id");