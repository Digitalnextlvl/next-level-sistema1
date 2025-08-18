-- Add new columns to clientes table
ALTER TABLE public.clientes 
ADD COLUMN endereco TEXT,
ADD COLUMN cnpj TEXT;