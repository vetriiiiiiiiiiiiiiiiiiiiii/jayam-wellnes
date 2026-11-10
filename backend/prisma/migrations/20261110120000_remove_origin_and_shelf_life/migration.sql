-- Content change, no schema change: stop showing where ingredients come from or a shelf life.
-- Removes those two specification rows and the "sourced from India" wording already saved.
DELETE FROM "ProductSpec" WHERE "name" IN ('Ingredient origin', 'Shelf life');

UPDATE "Product"
SET "ingredients" = replace("ingredients", ' Ingredients sourced from India.', '')
WHERE "ingredients" LIKE '%Ingredients sourced from India.%';

UPDATE "SiteContent"
SET "data" = replace("data"::text, ', carefully selected and sourced from India.', ', carefully selected.')::jsonb
WHERE "data"::text LIKE '%carefully selected and sourced from India.%';
