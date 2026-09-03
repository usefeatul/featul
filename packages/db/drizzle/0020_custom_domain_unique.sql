WITH ranked AS (
	SELECT
		"id",
		ROW_NUMBER() OVER (
			PARTITION BY "custom_domain"
			ORDER BY "updated_at" DESC
		) AS "rn"
	FROM "workspace"
	WHERE "custom_domain" IS NOT NULL
)
UPDATE "workspace"
SET "custom_domain" = NULL
WHERE "id" IN (
	SELECT "id" FROM ranked WHERE "rn" > 1
);
--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_custom_domain_unique" ON "workspace" USING btree ("custom_domain");
