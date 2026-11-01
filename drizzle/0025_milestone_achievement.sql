CREATE TABLE "milestone_achievement" (
	"user_id" text NOT NULL,
	"milestone_id" text NOT NULL,
	"scope_version" text NOT NULL,
	"achieved_at" timestamp with time zone NOT NULL,
	CONSTRAINT "milestone_achievement_user_id_milestone_id_pk" PRIMARY KEY("user_id","milestone_id")
);
--> statement-breakpoint
ALTER TABLE "milestone_achievement" ADD CONSTRAINT "milestone_achievement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;