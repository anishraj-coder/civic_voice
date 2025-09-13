INSERT INTO city (name, area, population, issue_count) VALUES
                                                           ('Ranchi', 182, 1304858, 0),
                                                           ('Jamshedpur', 209, 767486, 0),
                                                           ('Dhanbad', 223, 1413101, 0),
                                                           ('Bokaro Steel City', 187, 504255, 0),
                                                           ('Deoghar', 22, 246916, 0),
                                                           ('Hazaribag', 27, 173210, 0),
                                                           ('Giridih', 11, 139226, 0),
                                                           ('Ramgarh', 50, 121000, 0),
                                                           ('Medininagar', 3, 107000, 0),
                                                           ('Chirkunda', 25, 162000, 0),
                                                           ('Sahibganj', 9, 120000, 0),
                                                           ('Saunda', 24, 112000, 0),
                                                           ('Chaibasa', 8, 94000, 0),
                                                           ('Lohardaga', 14, 78000, 0),
                                                           ('Chakradharpur', 6, 77000, 0),
                                                           ('Madhupur', 18, 75000, 0),
                                                           ('Gumla', 11, 69000, 0),
                                                           ('Chatra', 11, 66000, 0),
                                                           ('Godda', 8, 65000, 0),
                                                           ('Pakur', 18, 116000, 0),
                                                           ('Khunti', 15, 104000, 0),
                                                           ('Simdega', 20, 98200, 0),
                                                           ('Latehar', 30, 110000, 0),
                                                           ('Dumka', 16, 94800, 0)
    ON CONFLICT (name) DO NOTHING;
-- Ranchi
INSERT INTO locality (name, city_id, issue_count) SELECT 'Harmu', id, 0 FROM city WHERE name='Ranchi';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Kokar', id, 0 FROM city WHERE name='Ranchi';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Doranda', id, 0 FROM city WHERE name='Ranchi';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Lalpur', id, 0 FROM city WHERE name='Ranchi';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Ashok Nagar', id, 0 FROM city WHERE name='Ranchi';

-- Jamshedpur
INSERT INTO locality (name, city_id, issue_count) SELECT 'Bistupur', id, 0 FROM city WHERE name='Jamshedpur';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Sakchi', id, 0 FROM city WHERE name='Jamshedpur';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Sonari', id, 0 FROM city WHERE name='Jamshedpur';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Telco Colony', id, 0 FROM city WHERE name='Jamshedpur';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Kadma', id, 0 FROM city WHERE name='Jamshedpur';

-- Dhanbad
INSERT INTO locality (name, city_id, issue_count) SELECT 'Bank More', id, 0 FROM city WHERE name='Dhanbad';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Hirapur', id, 0 FROM city WHERE name='Dhanbad';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Saraidhela', id, 0 FROM city WHERE name='Dhanbad';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Katras', id, 0 FROM city WHERE name='Dhanbad';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Govindpur', id, 0 FROM city WHERE name='Dhanbad';

-- Bokaro Steel City
INSERT INTO locality (name, city_id, issue_count) SELECT 'Sector 4', id, 0 FROM city WHERE name='Bokaro Steel City';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Sector 9', id, 0 FROM city WHERE name='Bokaro Steel City';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Sector 12', id, 0 FROM city WHERE name='Bokaro Steel City';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Sector 5', id, 0 FROM city WHERE name='Bokaro Steel City';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Chas', id, 0 FROM city WHERE name='Bokaro Steel City';

-- Deoghar
INSERT INTO locality (name, city_id, issue_count) SELECT 'Tower Chowk', id, 0 FROM city WHERE name='Deoghar';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Castairs Town', id, 0 FROM city WHERE name='Deoghar';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Barmasia', id, 0 FROM city WHERE name='Deoghar';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Williams Town', id, 0 FROM city WHERE name='Deoghar';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Jalsar', id, 0 FROM city WHERE name='Deoghar';

-- Hazaribag
INSERT INTO locality (name, city_id, issue_count) SELECT 'Korrah', id, 0 FROM city WHERE name='Hazaribag';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Pelawal', id, 0 FROM city WHERE name='Hazaribag';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Bara Bazar', id, 0 FROM city WHERE name='Hazaribag';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Kunds', id, 0 FROM city WHERE name='Hazaribag';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Matwari', id, 0 FROM city WHERE name='Hazaribag';

-- Giridih
INSERT INTO locality (name, city_id, issue_count) SELECT 'Isri', id, 0 FROM city WHERE name='Giridih';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Makatpur', id, 0 FROM city WHERE name='Giridih';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Bengabad', id, 0 FROM city WHERE name='Giridih';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Pachamba', id, 0 FROM city WHERE name='Giridih';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Bundu', id, 0 FROM city WHERE name='Giridih';

-- Ramgarh
INSERT INTO locality (name, city_id, issue_count) SELECT 'Patel Nagar', id, 0 FROM city WHERE name='Ramgarh';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Marar', id, 0 FROM city WHERE name='Ramgarh';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Sulhatu', id, 0 FROM city WHERE name='Ramgarh';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Cantonment', id, 0 FROM city WHERE name='Ramgarh';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Barkakana', id, 0 FROM city WHERE name='Ramgarh';

-- Medininagar
INSERT INTO locality (name, city_id, issue_count) SELECT 'Redma', id, 0 FROM city WHERE name='Medininagar';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Belwatika', id, 0 FROM city WHERE name='Medininagar';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Chiyanki', id, 0 FROM city WHERE name='Medininagar';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Daltonganj Bazar', id, 0 FROM city WHERE name='Medininagar';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Shahid Chowk', id, 0 FROM city WHERE name='Medininagar';

-- Chirkunda
INSERT INTO locality (name, city_id, issue_count) SELECT 'Mugma', id, 0 FROM city WHERE name='Chirkunda';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Nirsa', id, 0 FROM city WHERE name='Chirkunda';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Kumardubi', id, 0 FROM city WHERE name='Chirkunda';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Kalubathan', id, 0 FROM city WHERE name='Chirkunda';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Shiv Mandir Road', id, 0 FROM city WHERE name='Chirkunda';

-- Sahibganj
INSERT INTO locality (name, city_id, issue_count) SELECT 'Patna Colony', id, 0 FROM city WHERE name='Sahibganj';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Mirzachowki', id, 0 FROM city WHERE name='Sahibganj';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Barhait', id, 0 FROM city WHERE name='Sahibganj';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Tin Pahar', id, 0 FROM city WHERE name='Sahibganj';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Taljhari', id, 0 FROM city WHERE name='Sahibganj';

-- Saunda
INSERT INTO locality (name, city_id, issue_count) SELECT 'Saunda A', id, 0 FROM city WHERE name='Saunda';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Saunda B', id, 0 FROM city WHERE name='Saunda';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Sayal', id, 0 FROM city WHERE name='Saunda';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Urimari', id, 0 FROM city WHERE name='Saunda';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Bhadani Nagar', id, 0 FROM city WHERE name='Saunda';

-- Chaibasa
INSERT INTO locality (name, city_id, issue_count) SELECT 'Sadar Bazar', id, 0 FROM city WHERE name='Chaibasa';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Jhinkpani', id, 0 FROM city WHERE name='Chaibasa';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Mufassil', id, 0 FROM city WHERE name='Chaibasa';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Gua Road', id, 0 FROM city WHERE name='Chaibasa';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Tata College Road', id, 0 FROM city WHERE name='Chaibasa';

-- Lohardaga
INSERT INTO locality (name, city_id, issue_count) SELECT 'Alam Toli', id, 0 FROM city WHERE name='Lohardaga';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Kuru Road', id, 0 FROM city WHERE name='Lohardaga';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Kisko', id, 0 FROM city WHERE name='Lohardaga';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Chowk Bazar', id, 0 FROM city WHERE name='Lohardaga';
INSERT INTO locality (name, city_id, issue_count) SELECT 'Tikanatoli', id, 0 FROM city WHERE name='Lohardaga';
INSERT INTO department (name, category_handled) VALUES
                                                    ('Public Works Department', 'ROADS'),
                                                    ('Sanitation Department', 'SANITATION'),
                                                    ('Lighting Department', 'LIGHTING'),
                                                    ('Waste Management Division', 'WASTE'),
                                                    ('Water Supply Department', 'WATER')
    ON CONFLICT DO NOTHING;
-- Generate 2 issues per locality (≈ 240 issues total)
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
    22.0 + random()*3, 83.0 + random()*5,                             -- pseudo-random coordinates within Jharkhand bounds
    (ARRAY['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'])[floor(random()*3)+1], -- random status
    d.category_handled,
    d.id,          -- department
    c.id,          -- city
    l.id,          -- locality
    NOW(),
    NOW()
FROM locality l
    JOIN city c ON c.id = l.city_id
    JOIN department d ON d.category_handled IN ('ROADS','SANITATION','LIGHTING','WASTE','WATER')
    CROSS JOIN generate_series(1,2) gs;
-- Update city issue counts
UPDATE city c
SET issue_count = COALESCE((
                               SELECT COUNT(*) FROM issue_report ir WHERE ir.city_id = c.id
                           ), 0);

-- Update locality issue counts
UPDATE locality l
SET issue_count = COALESCE((
                               SELECT COUNT(*) FROM issue_report ir WHERE ir.locality_id = l.id
                           ), 0);