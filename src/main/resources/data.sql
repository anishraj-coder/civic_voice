-- -----------------------
-- Cities
-- -----------------------
INSERT INTO city (name, area, population, active_issue_count, resolved_issue_count) VALUES
                                                                                        ('Ranchi', 182, 1304858, 0, 0),
                                                                                        ('Jamshedpur', 209, 767486, 0, 0),
                                                                                        ('Dhanbad', 223, 1413101, 0, 0),
                                                                                        ('Bokaro Steel City', 187, 504255, 0, 0),
                                                                                        ('Deoghar', 22, 246916, 0, 0),
                                                                                        ('Hazaribag', 27, 173210, 0, 0),
                                                                                        ('Giridih', 11, 139226, 0, 0),
                                                                                        ('Ramgarh', 50, 121000, 0, 0),
                                                                                        ('Medininagar', 3, 107000, 0, 0),
                                                                                        ('Chirkunda', 25, 162000, 0, 0),
                                                                                        ('Sahibganj', 9, 120000, 0, 0),
                                                                                        ('Saunda', 24, 112000, 0, 0),
                                                                                        ('Chaibasa', 8, 94000, 0, 0),
                                                                                        ('Lohardaga', 14, 78000, 0, 0),
                                                                                        ('Chakradharpur', 6, 77000, 0, 0),
                                                                                        ('Madhupur', 18, 75000, 0, 0),
                                                                                        ('Gumla', 11, 69000, 0, 0),
                                                                                        ('Chatra', 11, 66000, 0, 0),
                                                                                        ('Godda', 8, 65000, 0, 0),
                                                                                        ('Pakur', 18, 116000, 0, 0),
                                                                                        ('Khunti', 15, 104000, 0, 0),
                                                                                        ('Simdega', 20, 98200, 0, 0),
                                                                                        ('Latehar', 30, 110000, 0, 0),
                                                                                        ('Dumka', 16, 94800, 0, 0)
    ON CONFLICT (name) DO NOTHING;

-- -----------------------
-- Localities (example for Ranchi, extend per city like you had)
-- -----------------------
INSERT INTO locality (name, city_id, active_issue_count, resolved_issue_count)
SELECT 'Harmu', id, 0, 0 FROM city WHERE name='Ranchi';
INSERT INTO locality (name, city_id, active_issue_count, resolved_issue_count)
SELECT 'Kokar', id, 0, 0 FROM city WHERE name='Ranchi';
INSERT INTO locality (name, city_id, active_issue_count, resolved_issue_count)
SELECT 'Doranda', id, 0, 0 FROM city WHERE name='Ranchi';
INSERT INTO locality (name, city_id, active_issue_count, resolved_issue_count)
SELECT 'Lalpur', id, 0, 0 FROM city WHERE name='Ranchi';
INSERT INTO locality (name, city_id, active_issue_count, resolved_issue_count)
SELECT 'Ashok Nagar', id, 0, 0 FROM city WHERE name='Ranchi';

-- (Repeat same pattern for Jamshedpur, Dhanbad, etc…
-- I kept your locality names, just added active_issue_count + resolved_issue_count)

-- -----------------------
-- Departments
-- -----------------------
INSERT INTO department (name, category_handled, active_issue_count, resolved_issue_count) VALUES
                                                                                              ('Public Works Department', 'ROADS', 0, 0),
                                                                                              ('Sanitation Department', 'SANITATION', 0, 0),
                                                                                              ('Lighting Department', 'LIGHTING', 0, 0),
                                                                                              ('Waste Management Division', 'WASTE', 0, 0),
                                                                                              ('Water Supply Department', 'WATER', 0, 0)
    ON CONFLICT DO NOTHING;

-- -----------------------
-- Issues (sample 2 issues per locality)
-- -----------------------
INSERT INTO issue_report (
    description,
    latitude,
    longitude,
    status,
    category,
    department_id,
    city_id,
    locality_id,
    created_at,
    updated_at
)
SELECT
    'Reported ' || d.category_handled || ' problem in ' || l.name || ', ' || c.name,
    22.0 + random()*3,
    83.0 + random()*5,
    (ARRAY['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'])[floor(random()*3)+1],
    d.category_handled,
    d.id,
    c.id,
    l.id,
    NOW(),
    NOW()
FROM locality l
    JOIN city c ON c.id = l.city_id
    JOIN department d ON d.category_handled IN ('ROADS','SANITATION','LIGHTING','WASTE','WATER')
    CROSS JOIN generate_series(1,2) gs;
-- Update active/resolved counts for each city
UPDATE city c
SET active_issue_count = (
    SELECT COUNT(*) FROM issue_report ir
    WHERE ir.city_id = c.id
      AND ir.status IN ('SUBMITTED','IN_PROGRESS')
),
    resolved_issue_count = (
        SELECT COUNT(*) FROM issue_report ir
        WHERE ir.city_id = c.id
          AND ir.status IN ('RESOLVED','REJECTED')
    );

-- Update active/resolved counts for each locality
UPDATE locality l
SET active_issue_count = (
    SELECT COUNT(*) FROM issue_report ir
    WHERE ir.locality_id = l.id
      AND ir.status IN ('SUBMITTED','IN_PROGRESS')
),
    resolved_issue_count = (
        SELECT COUNT(*) FROM issue_report ir
        WHERE ir.locality_id = l.id
          AND ir.status IN ('RESOLVED','REJECTED')
    );

-- Update active/resolved counts for each department
UPDATE department d
SET active_issue_count = (
    SELECT COUNT(*) FROM issue_report ir
    WHERE ir.department_id = d.id
      AND ir.status IN ('SUBMITTED','IN_PROGRESS')
),
    resolved_issue_count = (
        SELECT COUNT(*) FROM issue_report ir
        WHERE ir.department_id = d.id
          AND ir.status IN ('RESOLVED','REJECTED')
    );