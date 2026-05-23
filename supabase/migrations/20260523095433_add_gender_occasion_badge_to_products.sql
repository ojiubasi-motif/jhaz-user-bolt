/*
  # Add gender, occasion, and shipping_badge columns to products

  1. Modified Tables
    - `products`
      - `gender` (text, default 'women') - Target gender: men, women, kids
      - `occasion` (text, default 'casual') - Occasion type: wedding, casual, corporate, ceremonial
      - `shipping_badge` (text, default 'Made to Measure') - Badge: "Made to Measure" or "Ready to Ship"
  
  2. Notes
    - These fields enable the filter sidebar on the catalog page
    - shipping_badge replaces the previous "customizable" boolean with a richer display
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'gender'
  ) THEN
    ALTER TABLE products ADD COLUMN gender text DEFAULT 'women';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'occasion'
  ) THEN
    ALTER TABLE products ADD COLUMN occasion text DEFAULT 'casual';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'shipping_badge'
  ) THEN
    ALTER TABLE products ADD COLUMN shipping_badge text DEFAULT 'Made to Measure';
  END IF;
END $$;
