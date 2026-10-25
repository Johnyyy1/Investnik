CREATE TABLE "capstone_submission" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"capstone_id" text NOT NULL,
	"version" integer NOT NULL,
	"request_id" text NOT NULL,
	"artifact_refs" jsonb NOT NULL,
	"auto_criteria" jsonb NOT NULL,
	"self_assessment" jsonb NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "capstone_submission_version_positive" CHECK ("capstone_submission"."version" > 0)
);
--> statement-breakpoint
ALTER TABLE "capstone_submission" ADD CONSTRAINT "capstone_submission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "capstone_submission_version_idx" ON "capstone_submission" USING btree ("user_id","capstone_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "capstone_submission_request_idx" ON "capstone_submission" USING btree ("user_id","request_id");