/*
  # Create products and customization tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Product name
      - `slug` (text, unique, not null) - URL-friendly identifier
      - `description` (text) - Product description
      - `price` (numeric, not null) - Base price
      - `compare_at_price` (numeric) - Original/sale comparison price
      - `category` (text, not null) - Product category (dresses, tops, bottoms, jackets, sets, accessories)
      - `fabric_type` (text) - Type of African fabric (Ankara, Kente, Adire, Batik, etc.)
      - `image_url` (text) - Primary product image URL
      - `is_customizable` (boolean, default true) - Whether the product can be customized
      - `is_featured` (boolean, default false) - Featured/new arrival
      - `is_bestseller` (boolean, default false) - Bestseller status
      - `rating` (numeric, default 0) - Average rating
      - `review_count` (integer, default 0) - Number of reviews
      - `tag` (text) - Display tag (New, Bestseller, Limited)
      - `created_at` (timestamptz, default now())

    - `customization_options`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products) - Associated product
      - `option_type` (text, not null) - Type of customization (fabric, sleeve, neckline, hem_length, accent)
      - `option_name` (text, not null) - Display name of the option
      - `option_value` (text, not null) - Value/identifier for the option
      - `price_modifier` (numeric, default 0) - Additional price for this option
      - `display_order` (integer, default 0) - Order to display options
      - `is_default` (boolean, default false) - Whether this is the default selection
      - `created_at` (timestamptz, default now())

    - `custom_orders`
      - `id` (uuid, primary key)
      - `user_email` (text, not null) - Customer email
      - `product_id` (uuid, foreign key to products) - Selected product
      - `selected_options` (jsonb, default '{}') - Selected customization choices
      - `measurements` (jsonb, default '{}') - Customer measurements
      - `status` (text, default 'pending') - Order status (pending, confirmed, in_production, shipped, delivered)
      - `total_price` (numeric, not null) - Final calculated price
      - `notes` (text) - Additional notes from customer
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Products and customization_options: public read, authenticated write
    - Custom orders: users can only read their own orders (by email matching auth email)
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric NOT NULL,
  compare_at_price numeric,
  category text NOT NULL,
  fabric_type text,
  image_url text,
  is_customizable boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  tag text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customization_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option_type text NOT NULL,
  option_name text NOT NULL,
  option_value text NOT NULL,
  price_modifier numeric DEFAULT 0,
  display_order integer DEFAULT 0,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  selected_options jsonb DEFAULT '{}',
  measurements jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  total_price numeric NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;

-- Products: public read, authenticated write
CREATE POLICY "Public can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Customization options: public read, authenticated write
CREATE POLICY "Public can view customization options"
  ON customization_options FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create customization options"
  ON customization_options FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Custom orders: users can read own orders, anyone can create
CREATE POLICY "Users can view own orders"
  ON custom_orders FOR SELECT
  TO authenticated
  USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Anyone can create custom orders"
  ON custom_orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own orders"
  ON custom_orders FOR UPDATE
  TO authenticated
  USING (user_email = auth.jwt() ->> 'email')
  WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_customization_options_product ON customization_options(product_id);
CREATE INDEX IF NOT EXISTS idx_customization_options_type ON customization_options(option_type);
CREATE INDEX IF NOT EXISTS idx_custom_orders_email ON custom_orders(user_email);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON custom_orders(status);
