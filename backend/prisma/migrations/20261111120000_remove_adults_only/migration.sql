-- Content change, no schema change: stop saying the products are for adults only.
DELETE FROM "ProductSpec" WHERE "name" = 'Suitable for' AND "value" ILIKE 'adults%';

UPDATE "Product"
SET "warnings" = replace("warnings", 'For adults only. ', '')
WHERE "warnings" LIKE '%For adults only. %';

-- The "Good to know" list in each product story (and the older shared story content)
UPDATE "Product"
SET "story" = replace(replace(replace("story"::text, '"For adults only", ', ''), ', "For adults only"', ''), '"For adults only"', '')::jsonb
WHERE "story"::text LIKE '%"For adults only"%';

UPDATE "SiteContent"
SET "data" = replace(replace(replace("data"::text, '"For adults only", ', ''), ', "For adults only"', ''), '"For adults only"', '')::jsonb
WHERE "data"::text LIKE '%"For adults only"%';
