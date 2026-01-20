-- Responsive Frame Mapping Tables
-- Maps corresponding elements across different viewport designs

CREATE TABLE "responsive_frame_group" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"figma_account_id" text NOT NULL,
	"file_key" text NOT NULL,
	"base_name" text NOT NULL,
	"confidence" integer NOT NULL,
	"mobile_frame_id" text,
	"tablet_frame_id" text,
	"desktop_frame_id" text,
	"generated_css" text,
	"tailwind_classes" text,
	"status" text NOT NULL,
	"error_message" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "element_viewport_mapping" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"element_name" text NOT NULL,
	"element_path" text NOT NULL,
	"element_type" text NOT NULL,
	"confidence" integer NOT NULL,
	"mobile_element_id" text,
	"tablet_element_id" text,
	"desktop_element_id" text,
	"mobile_visibility" text,
	"tablet_visibility" text,
	"desktop_visibility" text,
	"mobile_properties" text,
	"tablet_properties" text,
	"desktop_properties" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "element_transformation" (
	"id" text PRIMARY KEY NOT NULL,
	"mapping_id" text NOT NULL,
	"from_viewport" text NOT NULL,
	"to_viewport" text NOT NULL,
	"transformation_type" text NOT NULL,
	"size_change" text,
	"position_change" text,
	"layout_change" text,
	"visibility_change" text,
	"style_changes" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "breakpoint_change" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"mapping_id" text NOT NULL,
	"element_name" text NOT NULL,
	"element_path" text NOT NULL,
	"change_type" text NOT NULL,
	"at_breakpoint" text NOT NULL,
	"from_breakpoint" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "responsive_frame_group" ADD CONSTRAINT "responsive_frame_group_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsive_frame_group" ADD CONSTRAINT "responsive_frame_group_figma_account_id_figma_account_id_fk" FOREIGN KEY ("figma_account_id") REFERENCES "public"."figma_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "element_viewport_mapping" ADD CONSTRAINT "element_viewport_mapping_group_id_responsive_frame_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."responsive_frame_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "element_transformation" ADD CONSTRAINT "element_transformation_mapping_id_element_viewport_mapping_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."element_viewport_mapping"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breakpoint_change" ADD CONSTRAINT "breakpoint_change_group_id_responsive_frame_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."responsive_frame_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breakpoint_change" ADD CONSTRAINT "breakpoint_change_mapping_id_element_viewport_mapping_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."element_viewport_mapping"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_responsive_frame_group_user_id" ON "responsive_frame_group" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_responsive_frame_group_file_key" ON "responsive_frame_group" USING btree ("file_key");--> statement-breakpoint
CREATE INDEX "idx_responsive_frame_group_base_name" ON "responsive_frame_group" USING btree ("base_name");--> statement-breakpoint
CREATE INDEX "idx_element_viewport_mapping_group_id" ON "element_viewport_mapping" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_element_viewport_mapping_element_path" ON "element_viewport_mapping" USING btree ("element_path");--> statement-breakpoint
CREATE INDEX "idx_element_transformation_mapping_id" ON "element_transformation" USING btree ("mapping_id");--> statement-breakpoint
CREATE INDEX "idx_element_transformation_type" ON "element_transformation" USING btree ("transformation_type");--> statement-breakpoint
CREATE INDEX "idx_breakpoint_change_group_id" ON "breakpoint_change" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_breakpoint_change_change_type" ON "breakpoint_change" USING btree ("change_type");
