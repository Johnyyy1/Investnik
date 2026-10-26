CREATE TABLE "artifact_share" (
 "token" text PRIMARY KEY,
 "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
 "artifact_id" text NOT NULL REFERENCES "learner_artifact"("id") ON DELETE CASCADE,
 "projection_version" integer NOT NULL DEFAULT 1 CHECK ("projection_version" = 1),
 "request_id" text NOT NULL,
 "created_at" timestamptz NOT NULL DEFAULT now(),
 "revoked_at" timestamptz
);
--> statement-breakpoint
CREATE UNIQUE INDEX "artifact_share_owner_request_idx" ON "artifact_share" ("user_id", "request_id");
--> statement-breakpoint
CREATE INDEX "artifact_share_artifact_idx" ON "artifact_share" ("artifact_id");
