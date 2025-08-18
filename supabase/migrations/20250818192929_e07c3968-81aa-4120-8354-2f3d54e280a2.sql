-- Add titulo and descricao columns to contratos table
ALTER TABLE public.contratos ADD COLUMN titulo text;
ALTER TABLE public.contratos ADD COLUMN descricao text;