-- Fashion E-Commerce Database Schema

-- Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_he VARCHAR(100) NOT NULL,
    parent_id INTEGER REFERENCES categories(id)
);

-- Brands
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(500)
);

-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    name_he VARCHAR(200) NOT NULL,
    description TEXT,
    brand_id INTEGER REFERENCES brands(id),
    category_id INTEGER REFERENCES categories(id),
    price NUMERIC(10,2) NOT NULL,
    cost_price NUMERIC(10,2) NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('men', 'women', 'unisex', 'kids')),
    image_url VARCHAR(500),
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(name_he, '') || ' ' || coalesce(description, ''))
    ) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    registration_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true
);

-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned')),
    total_amount NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    shipping_cost NUMERIC(10,2) DEFAULT 0,
    payment_method VARCHAR(20) CHECK (payment_method IN ('credit_card', 'paypal', 'bank_transfer', 'cash')),
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    shipping_date TIMESTAMP,
    delivered_date TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    size VARCHAR(10),
    color VARCHAR(50),
    discount_amount NUMERIC(10,2) DEFAULT 0
);

-- Payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    amount NUMERIC(10,2) NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('credit_card', 'paypal', 'bank_transfer', 'cash')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    paid_at TIMESTAMP DEFAULT NOW()
);

-- Shipments
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    carrier VARCHAR(100),
    tracking_number VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('preparing', 'shipped', 'in_transit', 'delivered', 'failed')),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    city VARCHAR(100)
);

-- Returns
CREATE TABLE returns (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    order_item_id INTEGER REFERENCES order_items(id),
    reason VARCHAR(50) CHECK (reason IN ('wrong_size', 'defective', 'not_as_described', 'changed_mind')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('requested', 'approved', 'received', 'refunded', 'rejected')),
    requested_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    refund_amount NUMERIC(10,2)
);

-- Inventory
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    size VARCHAR(10),
    color VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 0,
    warehouse_location VARCHAR(50),
    last_restocked_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_products_search ON products USING GIN (search_vector);
CREATE INDEX idx_orders_date ON orders (order_date);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);
CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_customers_city ON customers (city);
