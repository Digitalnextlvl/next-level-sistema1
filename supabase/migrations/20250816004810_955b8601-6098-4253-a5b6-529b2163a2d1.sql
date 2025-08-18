-- Adicionar foreign key entre contratos e clientes
ALTER TABLE public.contratos 
ADD CONSTRAINT fk_contratos_cliente_id 
FOREIGN KEY (cliente_id) 
REFERENCES public.clientes(id) 
ON DELETE CASCADE;