-- Script to wipe all data from the database
-- Order of deletion is important due to foreign key constraints

-- Delete all issue reports first (they depend on city, locality, department)
DELETE FROM issue_report;

-- Reset city and locality issue counts to 0
UPDATE city SET issue_count = 0;
UPDATE locality SET issue_count = 0;

-- Note: We're keeping the cities, localities, and departments as they are reference data
-- If you want to delete everything including reference data, uncomment the following:

-- DELETE FROM locality;
-- DELETE FROM department;
-- DELETE FROM city;

-- Reset sequences if needed
-- ALTER SEQUENCE issue_report_id_seq RESTART WITH 1;
-- ALTER SEQUENCE city_id_seq RESTART WITH 1;
-- ALTER SEQUENCE locality_id_seq RESTART WITH 1;
-- ALTER SEQUENCE department_id_seq RESTART WITH 1;
