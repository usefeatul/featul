ALTER TABLE "help_article" ADD COLUMN "search_text" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "help_article" ADD COLUMN "heading_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "help_article" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
CREATE INDEX "help_article_search_idx" ON "help_article" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "help_article_heading_search_idx" ON "help_article" USING gin ("heading_vector");--> statement-breakpoint
-- Keeps the search fields in step with the article, whichever code path writes it.
CREATE OR REPLACE FUNCTION help_article_search_refresh() RETURNS trigger AS $$
BEGIN
  NEW.search_text := coalesce(
    (SELECT string_agg(t #>> '{}', ' ') FROM jsonb_path_query(NEW.content::jsonb, 'strict $.**.text') AS t),
    ''
  );
  NEW.heading_vector := setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'B');
  NEW.search_vector := NEW.heading_vector || setweight(to_tsvector('english', NEW.search_text), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER help_article_search_refresh
  BEFORE INSERT OR UPDATE OF title, summary, content ON help_article
  FOR EACH ROW EXECUTE FUNCTION help_article_search_refresh();--> statement-breakpoint
-- Fill the new fields for existing articles.
UPDATE help_article SET title = title;
