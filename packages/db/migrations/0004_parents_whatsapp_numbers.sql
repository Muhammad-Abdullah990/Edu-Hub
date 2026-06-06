-- Add whatsapp_numbers column to parents table
ALTER TABLE "parents" ADD COLUMN IF NOT EXISTS "whatsapp_numbers" jsonb NOT NULL DEFAULT '[]'::jsonb;