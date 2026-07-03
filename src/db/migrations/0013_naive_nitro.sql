CREATE TYPE "public"."calendar_event_type" AS ENUM('interview', 'intro_call', 'client_call', 'internal', 'other');--> statement-breakpoint
CREATE TYPE "public"."event_attendee_status" AS ENUM('invited', 'accepted', 'declined', 'tentative');--> statement-breakpoint
CREATE TABLE "calendar_event_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid,
	"external_name" text,
	"external_email" text,
	"status" "event_attendee_status" DEFAULT 'invited' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"type" "calendar_event_type" DEFAULT 'other' NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone,
	"location" text,
	"notes" text,
	"organizer_user_id" uuid NOT NULL,
	"related_entity_type" text,
	"related_entity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_event_attendees" ADD CONSTRAINT "calendar_event_attendees_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_event_attendees" ADD CONSTRAINT "calendar_event_attendees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_organizer_user_id_users_id_fk" FOREIGN KEY ("organizer_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calendar_event_attendees_event_idx" ON "calendar_event_attendees" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "calendar_event_attendees_user_idx" ON "calendar_event_attendees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "calendar_events_organizer_idx" ON "calendar_events" USING btree ("organizer_user_id");--> statement-breakpoint
CREATE INDEX "calendar_events_start_at_idx" ON "calendar_events" USING btree ("start_at");