CREATE TABLE "analytics_acquisition_day" (
 "day" date NOT NULL,
 "source" text NOT NULL,
 "views" integer NOT NULL CHECK ("views" > 0),
 PRIMARY KEY ("day", "source")
);
