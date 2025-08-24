-- Add private field to projects table
ALTER TABLE public.projetos 
ADD COLUMN privado boolean NOT NULL DEFAULT false;