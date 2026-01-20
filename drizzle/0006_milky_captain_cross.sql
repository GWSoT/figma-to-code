CREATE TABLE "conversion_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"figma_account_id" text,
	"file_key" text NOT NULL,
	"file_name" text,
	"node_id" text NOT NULL,
	"node_name" text NOT NULL,
	"node_type" text,
	"conversion_type" text NOT NULL,
	"configuration_id" text,
	"configuration_snapshot" text,
	"js_framework" text,
	"css_framework" text,
	"output_code" text,
	"output_code_lines" integer,
	"output_format" text,
	"exported_assets_count" integer,
	"exported_assets_json" text,
	"duration_ms" integer,
	"status" text NOT NULL,
	"error_message" text,
	"version" integer NOT NULL,
	"parent_conversion_id" text,
	"tags" text,
	"notes" text,
	"is_favorite" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "conversion_history" ADD CONSTRAINT "conversion_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversion_history" ADD CONSTRAINT "conversion_history_figma_account_id_figma_account_id_fk" FOREIGN KEY ("figma_account_id") REFERENCES "public"."figma_account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversion_history" ADD CONSTRAINT "conversion_history_configuration_id_project_configuration_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."project_configuration"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_conversion_history_user_id" ON "conversion_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_conversion_history_figma_account_id" ON "conversion_history" USING btree ("figma_account_id");--> statement-breakpoint
CREATE INDEX "idx_conversion_history_file_key" ON "conversion_history" USING btree ("file_key");--> statement-breakpoint
CREATE INDEX "idx_conversion_history_node_id" ON "conversion_history" USING btree ("node_id");--> statement-breakpoint
CREATE INDEX "idx_conversion_history_status" ON "conversion_history" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_conversion_history_conversion_type" ON "conversion_history" USING btree ("conversion_type");--> statement-breakpoint
CREATE INDEX "idx_conversion_history_created_at" ON "conversion_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_conversion_history_is_favorite" ON "conversion_history" USING btree ("is_favorite");--> statement-breakpoint
CREATE INDEX "idx_conversion_history_parent_id" ON "conversion_history" USING btree ("parent_conversion_id");