-- Reconcile Product.costPrice with the existing database schema.
-- The column already exists in Neon.
-- This migration is also needed so Prisma's shadow database
-- can replay the migration history correctly.

ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "costPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;