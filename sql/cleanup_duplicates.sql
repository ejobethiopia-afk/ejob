-- SQL query to remove duplicate jobs
-- This keeps the LATEST job (by created_at) and deletes older duplicates
-- based on identical Title, Company, and Description.

DELETE FROM jobs a USING (
    SELECT min(ctid) as ctid, id
    FROM jobs 
    GROUP BY title, company_name, description 
    HAVING COUNT(*) > 1
) b
WHERE a.title = (SELECT title FROM jobs WHERE id = b.id)
AND a.company_name = (SELECT company_name FROM jobs WHERE id = b.id)
AND a.description = (SELECT description FROM jobs WHERE id = b.id)
AND a.id <> (
    -- Keep the most recent one
    SELECT id FROM jobs j2
    WHERE j2.title = a.title 
    AND j2.company_name = a.company_name 
    AND j2.description = a.description
    ORDER BY created_at DESC 
    LIMIT 1
);

-- Alternative simpler approach: disable safe updates if needed or run this:
/*
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
            PARTITION BY title, company_name, description 
            ORDER BY created_at DESC
         ) AS row_num
  FROM jobs
)
DELETE FROM jobs
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);
*/
