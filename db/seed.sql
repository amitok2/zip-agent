-- Fashion E-Commerce Seed Data

-- Brands (10)
INSERT INTO brands (name, logo_url) VALUES
('Zara', NULL),
('H&M', NULL),
('Nike', NULL),
('Adidas', NULL),
('Levi''s', NULL),
('Mango', NULL),
('Castro', NULL),
('Fox', NULL),
('Renuar', NULL),
('Tommy Hilfiger', NULL);

-- Categories (15)
INSERT INTO categories (name, name_he, parent_id) VALUES
('Dresses', 'שמלות', NULL),
('T-Shirts', 'חולצות טי', NULL),
('Shirts', 'חולצות מכופתרות', NULL),
('Jeans', 'ג''ינסים', NULL),
('Pants', 'מכנסיים', NULL),
('Skirts', 'חצאיות', NULL),
('Shoes', 'נעליים', NULL),
('Sneakers', 'סניקרס', NULL),
('Jackets', 'ז''קטים', NULL),
('Coats', 'מעילים', NULL),
('Bags', 'תיקים', NULL),
('Accessories', 'אקססוריז', NULL),
('Underwear', 'הלבשה תחתונה', NULL),
('Sportswear', 'ביגוד ספורט', NULL),
('Swimwear', 'בגדי ים', NULL);

-- Products (80+)
INSERT INTO products (sku, name, name_he, description, brand_id, category_id, price, cost_price, gender, tags) VALUES
-- Dresses (cat 1)
('ZR-DR-001', 'Floral Midi Dress', 'שמלת מידי פרחונית', 'Elegant floral print midi dress', 1, 1, 349.90, 209.94, 'women', ARRAY['floral','midi','elegant']),
('ZR-DR-002', 'Black Evening Dress', 'שמלת ערב שחורה', 'Classic black evening dress', 1, 1, 499.90, 299.94, 'women', ARRAY['evening','black','classic']),
('MN-DR-003', 'Summer Wrap Dress', 'שמלת מעטפת קיצית', 'Light summer wrap dress', 6, 1, 289.90, 173.94, 'women', ARRAY['summer','wrap','light']),
('HM-DR-004', 'Casual Day Dress', 'שמלת יומיום', 'Comfortable casual day dress', 2, 1, 149.90, 89.94, 'women', ARRAY['casual','daily','comfortable']),
('RN-DR-005', 'Office Sheath Dress', 'שמלת נדן למשרד', 'Professional office sheath dress', 9, 1, 399.90, 239.94, 'women', ARRAY['office','professional','sheath']),
('CS-DR-006', 'Knit Sweater Dress', 'שמלת סריג', 'Warm knit sweater dress', 7, 1, 279.90, 167.94, 'women', ARRAY['knit','sweater','warm']),

-- T-Shirts (cat 2)
('NK-TS-001', 'Classic Logo Tee', 'חולצת טי לוגו קלאסית', 'Nike classic logo t-shirt', 3, 2, 129.90, 77.94, 'unisex', ARRAY['logo','classic','cotton']),
('AD-TS-002', 'Three Stripes Tee', 'חולצת טי שלושה פסים', 'Adidas three stripes tee', 4, 2, 119.90, 71.94, 'unisex', ARRAY['stripes','sport','cotton']),
('HM-TS-003', 'Basic V-Neck Tee', 'חולצת טי בייסיק וי', 'Basic v-neck cotton tee', 2, 2, 49.90, 29.94, 'men', ARRAY['basic','v-neck','cotton']),
('HM-TS-004', 'Oversized Graphic Tee', 'חולצת טי אוברסייז גרפית', 'Oversized graphic print tee', 2, 2, 79.90, 47.94, 'women', ARRAY['oversized','graphic','trendy']),
('ZR-TS-005', 'Premium Cotton Tee', 'חולצת טי כותנה פרמיום', 'Premium quality cotton tee', 1, 2, 99.90, 59.94, 'men', ARRAY['premium','cotton','quality']),
('FX-TS-006', 'Printed Pocket Tee', 'חולצת טי כיס מודפסת', 'Casual printed pocket tee', 8, 2, 89.90, 53.94, 'men', ARRAY['printed','pocket','casual']),

-- Shirts (cat 3)
('TH-SH-001', 'Oxford Button-Down', 'חולצה מכופתרת אוקספורד', 'Classic oxford button-down shirt', 10, 3, 349.90, 209.94, 'men', ARRAY['oxford','button-down','classic']),
('ZR-SH-002', 'Linen Summer Shirt', 'חולצת פשתן קיצית', 'Light linen summer shirt', 1, 3, 249.90, 149.94, 'men', ARRAY['linen','summer','light']),
('CS-SH-003', 'Slim Fit Dress Shirt', 'חולצה מכופתרת סלים', 'Slim fit formal dress shirt', 7, 3, 199.90, 119.94, 'men', ARRAY['slim','formal','dress']),
('MN-SH-004', 'Satin Blouse', 'חולצת סאטן', 'Elegant satin blouse', 6, 3, 229.90, 137.94, 'women', ARRAY['satin','elegant','blouse']),
('RN-SH-005', 'Silk Print Blouse', 'חולצת משי מודפסת', 'Silk print office blouse', 9, 3, 319.90, 191.94, 'women', ARRAY['silk','print','office']),

-- Jeans (cat 4)
('LV-JN-001', '501 Original Jeans', 'ג''ינס 501 מקורי', 'Levi''s 501 original fit jeans', 5, 4, 399.90, 239.94, 'men', ARRAY['501','original','classic']),
('LV-JN-002', 'High Rise Skinny', 'ג''ינס סקיני גבוה', 'High rise skinny jeans', 5, 4, 349.90, 209.94, 'women', ARRAY['high-rise','skinny','stretch']),
('ZR-JN-003', 'Wide Leg Jeans', 'ג''ינס רחב', 'Trendy wide leg jeans', 1, 4, 299.90, 179.94, 'women', ARRAY['wide-leg','trendy','denim']),
('HM-JN-004', 'Slim Fit Jeans', 'ג''ינס סלים פיט', 'Classic slim fit jeans', 2, 4, 199.90, 119.94, 'men', ARRAY['slim','fit','classic']),
('FX-JN-005', 'Ripped Boyfriend Jeans', 'ג''ינס בויפרנד קרוע', 'Ripped boyfriend style jeans', 8, 4, 249.90, 149.94, 'women', ARRAY['ripped','boyfriend','casual']),

-- Pants (cat 5)
('ZR-PN-001', 'Tailored Trousers', 'מכנסיים מחויטים', 'Classic tailored trousers', 1, 5, 299.90, 179.94, 'men', ARRAY['tailored','classic','formal']),
('CS-PN-002', 'Chino Pants', 'מכנסי צ''ינו', 'Casual chino pants', 7, 5, 229.90, 137.94, 'men', ARRAY['chino','casual','cotton']),
('MN-PN-003', 'Wide Palazzo Pants', 'מכנסי פלאצו רחבים', 'Flowing palazzo pants', 6, 5, 279.90, 167.94, 'women', ARRAY['palazzo','wide','flowing']),
('RN-PN-004', 'Office Trousers', 'מכנסיים למשרד', 'Professional office trousers', 9, 5, 349.90, 209.94, 'women', ARRAY['office','professional','tailored']),
('AD-PN-005', 'Track Pants', 'מכנסי טראק', 'Sport track pants', 4, 5, 249.90, 149.94, 'unisex', ARRAY['track','sport','comfortable']),

-- Skirts (cat 6)
('ZR-SK-001', 'Pleated Midi Skirt', 'חצאית מידי פליסה', 'Elegant pleated midi skirt', 1, 6, 249.90, 149.94, 'women', ARRAY['pleated','midi','elegant']),
('HM-SK-002', 'Denim Mini Skirt', 'חצאית מיני ג''ינס', 'Classic denim mini skirt', 2, 6, 149.90, 89.94, 'women', ARRAY['denim','mini','classic']),
('MN-SK-003', 'A-Line Skirt', 'חצאית A-LINE', 'Versatile A-line skirt', 6, 6, 199.90, 119.94, 'women', ARRAY['a-line','versatile','office']),
('CS-SK-004', 'Pencil Skirt', 'חצאית עיפרון', 'Professional pencil skirt', 7, 6, 219.90, 131.94, 'women', ARRAY['pencil','professional','office']),

-- Shoes (cat 7)
('NK-SH-001', 'Leather Loafers', 'נעלי לופר עור', 'Classic leather loafers', 3, 7, 499.90, 299.94, 'men', ARRAY['leather','loafers','classic']),
('ZR-SH-006', 'Heeled Ankle Boots', 'מגפוני עקב', 'Stylish heeled ankle boots', 1, 7, 549.90, 329.94, 'women', ARRAY['heeled','boots','ankle']),
('CS-SH-007', 'Oxford Shoes', 'נעלי אוקספורד', 'Classic oxford shoes', 7, 7, 449.90, 269.94, 'men', ARRAY['oxford','classic','formal']),
('MN-SH-008', 'Strappy Sandals', 'סנדלי רצועות', 'Elegant strappy sandals', 6, 7, 299.90, 179.94, 'women', ARRAY['strappy','sandals','elegant']),

-- Sneakers (cat 8)
('NK-SN-001', 'Air Max 90', 'אייר מקס 90', 'Nike Air Max 90 sneakers', 3, 8, 599.90, 359.94, 'unisex', ARRAY['air-max','running','iconic']),
('AD-SN-002', 'Ultraboost', 'אולטראבוסט', 'Adidas Ultraboost running shoes', 4, 8, 699.90, 419.94, 'unisex', ARRAY['ultraboost','running','comfort']),
('NK-SN-003', 'Air Force 1', 'אייר פורס 1', 'Nike Air Force 1 classic', 3, 8, 499.90, 299.94, 'unisex', ARRAY['air-force','classic','white']),
('AD-SN-004', 'Stan Smith', 'סטן סמית''', 'Adidas Stan Smith classic', 4, 8, 449.90, 269.94, 'unisex', ARRAY['stan-smith','classic','white']),
('NK-SN-005', 'React Vision', 'ריאקט ויז''ן', 'Nike React Vision futuristic', 3, 8, 549.90, 329.94, 'unisex', ARRAY['react','futuristic','comfort']),
('HM-SN-006', 'Canvas Sneakers', 'סניקרס קנבס', 'Basic canvas sneakers', 2, 8, 149.90, 89.94, 'unisex', ARRAY['canvas','basic','casual']),

-- Jackets (cat 9)
('ZR-JK-001', 'Leather Biker Jacket', 'ז''קט עור בייקר', 'Classic leather biker jacket', 1, 9, 899.90, 539.94, 'men', ARRAY['leather','biker','classic']),
('TH-JK-002', 'Bomber Jacket', 'ז''קט בומבר', 'Tommy bomber jacket', 10, 9, 699.90, 419.94, 'men', ARRAY['bomber','casual','tommy']),
('NK-JK-003', 'Windbreaker', 'ז''קט רוח', 'Lightweight windbreaker', 3, 9, 399.90, 239.94, 'unisex', ARRAY['windbreaker','light','sport']),
('MN-JK-004', 'Blazer', 'בלייזר', 'Classic women blazer', 6, 9, 499.90, 299.94, 'women', ARRAY['blazer','classic','office']),
('CS-JK-005', 'Denim Jacket', 'ז''קט ג''ינס', 'Classic denim jacket', 7, 9, 349.90, 209.94, 'unisex', ARRAY['denim','classic','casual']),

-- Coats (cat 10)
('ZR-CT-001', 'Wool Overcoat', 'מעיל צמר', 'Premium wool overcoat', 1, 10, 799.90, 479.94, 'men', ARRAY['wool','overcoat','premium']),
('TH-CT-002', 'Trench Coat', 'מעיל טרנץ''', 'Classic trench coat', 10, 10, 899.90, 539.94, 'women', ARRAY['trench','classic','elegant']),
('HM-CT-003', 'Puffer Jacket', 'מעיל פוך', 'Warm puffer jacket', 2, 10, 449.90, 269.94, 'unisex', ARRAY['puffer','warm','winter']),
('CS-CT-004', 'Peacoat', 'מעיל פיקוט', 'Classic navy peacoat', 7, 10, 599.90, 359.94, 'men', ARRAY['peacoat','navy','classic']),

-- Bags (cat 11)
('ZR-BG-001', 'Leather Tote Bag', 'תיק טוט עור', 'Large leather tote bag', 1, 11, 399.90, 239.94, 'women', ARRAY['tote','leather','large']),
('MN-BG-002', 'Crossbody Bag', 'תיק קרוסבודי', 'Compact crossbody bag', 6, 11, 249.90, 149.94, 'women', ARRAY['crossbody','compact','daily']),
('TH-BG-003', 'Weekend Duffle', 'תיק דאפל לסופ"ש', 'Weekend travel duffle bag', 10, 11, 499.90, 299.94, 'unisex', ARRAY['duffle','travel','weekend']),
('NK-BG-004', 'Sport Backpack', 'תרמיל ספורט', 'Sport training backpack', 3, 11, 299.90, 179.94, 'unisex', ARRAY['backpack','sport','training']),

-- Accessories (cat 12)
('TH-AC-001', 'Leather Belt', 'חגורת עור', 'Premium leather belt', 10, 12, 249.90, 149.94, 'men', ARRAY['belt','leather','premium']),
('ZR-AC-002', 'Silk Scarf', 'צעיף משי', 'Elegant silk scarf', 1, 12, 199.90, 119.94, 'women', ARRAY['scarf','silk','elegant']),
('CS-AC-003', 'Wool Beanie', 'כובע צמר', 'Warm wool beanie', 7, 12, 79.90, 47.94, 'unisex', ARRAY['beanie','wool','warm']),
('FX-AC-004', 'Sunglasses', 'משקפי שמש', 'Classic sunglasses', 8, 12, 179.90, 107.94, 'unisex', ARRAY['sunglasses','classic','summer']),
('AD-AC-005', 'Sport Watch', 'שעון ספורט', 'Digital sport watch', 4, 12, 349.90, 209.94, 'unisex', ARRAY['watch','sport','digital']),

-- Underwear (cat 13)
('HM-UW-001', 'Cotton Boxer Briefs 3-Pack', 'תחתוני בוקסר כותנה 3 יח''', 'Cotton boxer briefs pack of 3', 2, 13, 99.90, 59.94, 'men', ARRAY['boxer','cotton','pack']),
('HM-UW-002', 'Lace Bralette', 'ברלט תחרה', 'Comfortable lace bralette', 2, 13, 79.90, 47.94, 'women', ARRAY['bralette','lace','comfortable']),
('CS-UW-003', 'Cotton Briefs 5-Pack', 'תחתונים כותנה 5 יח''', 'Cotton briefs value pack', 7, 13, 129.90, 77.94, 'women', ARRAY['briefs','cotton','value']),
('NK-UW-004', 'Sport Bra', 'חזיית ספורט', 'High support sport bra', 3, 13, 169.90, 101.94, 'women', ARRAY['sport-bra','support','training']),

-- Sportswear (cat 14)
('NK-SP-001', 'Dri-FIT Training Set', 'סט אימונים דריי-פיט', 'Nike Dri-FIT training set', 3, 14, 349.90, 209.94, 'men', ARRAY['dri-fit','training','set']),
('AD-SP-002', 'Yoga Leggings', 'טייץ יוגה', 'High waist yoga leggings', 4, 14, 249.90, 149.94, 'women', ARRAY['yoga','leggings','high-waist']),
('NK-SP-003', 'Running Shorts', 'מכנסי ריצה קצרים', 'Lightweight running shorts', 3, 14, 179.90, 107.94, 'men', ARRAY['running','shorts','light']),
('AD-SP-004', 'Sport Hoodie', 'קפוצ''ון ספורט', 'Warm sport hoodie', 4, 14, 299.90, 179.94, 'unisex', ARRAY['hoodie','sport','warm']),
('FX-SP-005', 'Gym Tank Top', 'גופיית חדר כושר', 'Breathable gym tank top', 8, 14, 89.90, 53.94, 'men', ARRAY['tank','gym','breathable']),

-- Swimwear (cat 15)
('RN-SW-001', 'One-Piece Swimsuit', 'בגד ים שלם', 'Elegant one-piece swimsuit', 9, 15, 249.90, 149.94, 'women', ARRAY['one-piece','elegant','pool']),
('NK-SW-002', 'Swim Trunks', 'בגד ים גברים', 'Quick-dry swim trunks', 3, 15, 179.90, 107.94, 'men', ARRAY['trunks','quick-dry','beach']),
('HM-SW-003', 'Bikini Set', 'סט ביקיני', 'Trendy bikini set', 2, 15, 199.90, 119.94, 'women', ARRAY['bikini','set','trendy']),
('AD-SW-004', 'Competition Swimsuit', 'בגד ים תחרותי', 'Competition swim suit', 4, 15, 299.90, 179.94, 'unisex', ARRAY['competition','swim','performance']);

-- Additional products to reach 80+
INSERT INTO products (sku, name, name_he, description, brand_id, category_id, price, cost_price, gender, tags) VALUES
('ZR-TS-007', 'Crop Top', 'קרופ טופ', 'Trendy crop top', 1, 2, 89.90, 53.94, 'women', ARRAY['crop','trendy','summer']),
('FX-PN-006', 'Cargo Pants', 'מכנסי קרגו', 'Utility cargo pants', 8, 5, 259.90, 155.94, 'men', ARRAY['cargo','utility','casual']),
('LV-JK-006', 'Trucker Jacket', 'ז''קט טראקר', 'Classic trucker denim jacket', 5, 9, 449.90, 269.94, 'unisex', ARRAY['trucker','denim','classic']),
('TH-TS-008', 'Polo Shirt', 'חולצת פולו', 'Classic polo shirt', 10, 2, 299.90, 179.94, 'men', ARRAY['polo','classic','cotton']),
('RN-SK-005', 'Wrap Skirt', 'חצאית מעטפת', 'Elegant wrap skirt', 9, 6, 269.90, 161.94, 'women', ARRAY['wrap','elegant','office']),
('NK-JK-007', 'Down Vest', 'וסט פוך', 'Lightweight down vest', 3, 9, 349.90, 209.94, 'unisex', ARRAY['vest','down','light']),
('CS-TS-009', 'Henley Shirt', 'חולצת הנלי', 'Casual henley shirt', 7, 2, 119.90, 71.94, 'men', ARRAY['henley','casual','button']),
('MN-DR-007', 'Maxi Dress', 'שמלת מקסי', 'Flowing maxi dress', 6, 1, 329.90, 197.94, 'women', ARRAY['maxi','flowing','summer']),
('AD-SN-008', 'Gazelle', 'גאזל', 'Adidas Gazelle classic', 4, 8, 499.90, 299.94, 'unisex', ARRAY['gazelle','classic','retro']),
('HM-JN-009', 'Mom Jeans', 'ג''ינס מאם', 'Relaxed mom jeans', 2, 4, 179.90, 107.94, 'women', ARRAY['mom','relaxed','vintage']);


-- Customers (200+) - Generate with Israeli cities and names
INSERT INTO customers (first_name, last_name, email, phone, city, registration_date, is_active)
SELECT
    (ARRAY['יוסי','דני','מיכל','רונית','אבי','שרה','דוד','נועה','עמית','טלי',
           'גיל','מאיה','ערן','ליאת','אורי','רותם','איתי','שירה','ניר','הדר',
           'תומר','אפרת','יובל','ענת','רועי','דנה','עידו','מיכאל','לירון','קרן',
           'אלון','סיגל','נדב','אורלי','שי','יעל','בועז','גלית','אייל','מורן',
           'עופר','חנה','צחי','ורד','אסף','רחלי','גדי','אורית','יניב','נעמי'])[1 + (g % 50)] AS first_name,
    (ARRAY['כהן','לוי','מזרחי','פרץ','ביטון','אברהם','דוד','אוחנה','מלכה','שלום',
           'גולן','חדד','אדרי','נחום','גבאי','ישראלי','עמר','חן','פרידמן','רוזנברג',
           'ברק','שפירא','אלוני','מור','אליהו','רגב','סגל','יוסף','נגר','הלוי',
           'זהבי','בנימין','קדוש','טל','שמש','ברגר','ויצמן','צור','לביא','דהן',
           'קליין','בוזגלו','אזולאי','חכם','סבן','ממן','אוזן','שושן','תורג''מן','עזרא'])[1 + ((g * 7 + 3) % 50)] AS last_name,
    'customer' || g || '@example.com' AS email,
    '05' || (2 + (g % 8))::text || '-' || LPAD((1000000 + g * 37 % 9000000)::text, 7, '0') AS phone,
    (ARRAY['תל אביב','ירושלים','חיפה','באר שבע','ראשון לציון','פתח תקווה',
           'אשדוד','נתניה','הרצליה','רחובות','כפר סבא','רמת גן','חולון',
           'אשקלון','בת ים','מודיעין','רעננה','הוד השרון','לוד','אילת'])[1 + (g % 20)] AS city,
    CURRENT_DATE - (random() * 365 * 2)::int AS registration_date,
    CASE WHEN random() < 0.95 THEN true ELSE false END AS is_active
FROM generate_series(1, 220) AS g;


-- Orders (500+) spread over last 6 months
INSERT INTO orders (customer_id, status, total_amount, discount_amount, shipping_cost, payment_method, order_date, shipping_date, delivered_date)
SELECT
    1 + (random() * 219)::int AS customer_id,
    (ARRAY['pending','confirmed','shipped','delivered','delivered','delivered','delivered','cancelled','returned'])[1 + (random() * 8)::int] AS status,
    0 AS total_amount, -- will be updated after order_items
    CASE WHEN random() < 0.3 THEN round((random() * 50)::numeric, 2) ELSE 0 END AS discount_amount,
    CASE WHEN random() < 0.2 THEN 0 ELSE round((25 + random() * 25)::numeric, 2) END AS shipping_cost,
    (ARRAY['credit_card','credit_card','credit_card','paypal','bank_transfer','cash'])[1 + (random() * 5)::int] AS payment_method,
    NOW() - (random() * 180)::int * INTERVAL '1 day' - (random() * 24)::int * INTERVAL '1 hour' AS order_date,
    NULL AS shipping_date,
    NULL AS delivered_date
FROM generate_series(1, 550);

-- Update shipping_date and delivered_date based on status
UPDATE orders SET shipping_date = order_date + INTERVAL '1 day' + (random() * 2)::int * INTERVAL '1 day'
WHERE status IN ('shipped', 'delivered', 'returned');

UPDATE orders SET delivered_date = shipping_date + INTERVAL '2 days' + (random() * 5)::int * INTERVAL '1 day'
WHERE status = 'delivered';


-- Order Items (avg ~2.4 per order)
-- First item for each order
INSERT INTO order_items (order_id, product_id, quantity, unit_price, size, color, discount_amount)
SELECT
    o.id AS order_id,
    1 + (random() * 83)::int AS product_id,
    1 + (random() * 2)::int AS quantity,
    p.price AS unit_price,
    (ARRAY['XS','S','M','L','XL','XXL'])[1 + (random() * 5)::int] AS size,
    (ARRAY['שחור','לבן','כחול','אדום','ירוק','אפור','בז''','ורוד','חום','נייבי'])[1 + (random() * 9)::int] AS color,
    CASE WHEN random() < 0.15 THEN round((random() * 30)::numeric, 2) ELSE 0 END AS discount_amount
FROM orders o
CROSS JOIN LATERAL (SELECT price FROM products WHERE id = 1 + (random() * 83)::int LIMIT 1) p;

-- Second item for ~70% of orders
INSERT INTO order_items (order_id, product_id, quantity, unit_price, size, color, discount_amount)
SELECT
    o.id AS order_id,
    1 + (random() * 83)::int AS product_id,
    1 AS quantity,
    p.price AS unit_price,
    (ARRAY['XS','S','M','L','XL','XXL'])[1 + (random() * 5)::int] AS size,
    (ARRAY['שחור','לבן','כחול','אדום','ירוק','אפור','בז''','ורוד','חום','נייבי'])[1 + (random() * 9)::int] AS color,
    0 AS discount_amount
FROM orders o
CROSS JOIN LATERAL (SELECT price FROM products WHERE id = 1 + (random() * 83)::int LIMIT 1) p
WHERE random() < 0.70;

-- Third item for ~30% of orders
INSERT INTO order_items (order_id, product_id, quantity, unit_price, size, color, discount_amount)
SELECT
    o.id AS order_id,
    1 + (random() * 83)::int AS product_id,
    1 AS quantity,
    p.price AS unit_price,
    (ARRAY['XS','S','M','L','XL','XXL'])[1 + (random() * 5)::int] AS size,
    (ARRAY['שחור','לבן','כחול','אדום','ירוק','אפור','בז''','ורוד','חום','נייבי'])[1 + (random() * 9)::int] AS color,
    0 AS discount_amount
FROM orders o
CROSS JOIN LATERAL (SELECT price FROM products WHERE id = 1 + (random() * 83)::int LIMIT 1) p
WHERE random() < 0.30;

-- Update order total_amount based on order_items
UPDATE orders SET total_amount = sub.total - orders.discount_amount + orders.shipping_cost
FROM (
    SELECT order_id, SUM(unit_price * quantity - discount_amount) AS total
    FROM order_items GROUP BY order_id
) sub
WHERE orders.id = sub.order_id;


-- Payments (one per order)
INSERT INTO payments (order_id, amount, method, status, paid_at)
SELECT
    o.id,
    o.total_amount,
    o.payment_method,
    CASE
        WHEN o.status = 'cancelled' THEN 'failed'
        WHEN o.status = 'returned' THEN 'refunded'
        WHEN o.status = 'pending' THEN 'pending'
        ELSE 'completed'
    END AS status,
    o.order_date + INTERVAL '5 minutes'
FROM orders o;


-- Shipments (for non-cancelled, non-pending orders)
INSERT INTO shipments (order_id, carrier, tracking_number, status, shipped_at, delivered_at, city)
SELECT
    o.id,
    (ARRAY['Israel Post', 'DHL', 'UPS', 'FedEx', 'Cheetah Delivery'])[1 + (random() * 4)::int],
    'TRK' || LPAD(o.id::text, 8, '0'),
    CASE
        WHEN o.status = 'confirmed' THEN 'preparing'
        WHEN o.status = 'shipped' THEN (ARRAY['shipped','in_transit'])[1 + (random() * 1)::int]
        WHEN o.status = 'delivered' THEN 'delivered'
        WHEN o.status = 'returned' THEN 'delivered'
        ELSE 'preparing'
    END,
    o.shipping_date,
    o.delivered_date,
    c.city
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status NOT IN ('cancelled', 'pending');


-- Returns (~12% of delivered orders)
INSERT INTO returns (order_id, order_item_id, reason, status, requested_at, processed_at, refund_amount)
SELECT
    oi.order_id,
    oi.id,
    (ARRAY['wrong_size','defective','not_as_described','changed_mind','wrong_size','changed_mind'])[1 + (random() * 5)::int],
    (ARRAY['requested','approved','received','refunded','refunded','refunded'])[1 + (random() * 5)::int],
    o.delivered_date + (random() * 14)::int * INTERVAL '1 day',
    CASE WHEN random() < 0.7 THEN o.delivered_date + (14 + random() * 7)::int * INTERVAL '1 day' ELSE NULL END,
    oi.unit_price * oi.quantity
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'delivered'
  AND o.delivered_date IS NOT NULL
  AND random() < 0.12;


-- Inventory (for each product with size/color combinations)
INSERT INTO inventory (product_id, size, color, quantity, warehouse_location, last_restocked_at)
SELECT
    p.id,
    s.size,
    c.color,
    (random() * 50)::int AS quantity,
    'WH-' || (ARRAY['A','B','C'])[1 + (random() * 2)::int] || '-' || LPAD((random() * 99)::int::text, 2, '0'),
    NOW() - (random() * 30)::int * INTERVAL '1 day'
FROM products p
CROSS JOIN (VALUES ('S'),('M'),('L'),('XL')) AS s(size)
CROSS JOIN (VALUES ('שחור'),('לבן'),('כחול')) AS c(color)
WHERE random() < 0.6;
