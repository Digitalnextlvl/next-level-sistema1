-- Fix foreign key constraint to allow cascade delete for vendas
-- Drop the existing foreign key constraint
ALTER TABLE transacoes_financeiras 
DROP CONSTRAINT IF EXISTS transacoes_financeiras_venda_id_fkey;

-- Recreate the foreign key constraint with CASCADE DELETE
ALTER TABLE transacoes_financeiras 
ADD CONSTRAINT transacoes_financeiras_venda_id_fkey 
FOREIGN KEY (venda_id) 
REFERENCES vendas(id) 
ON DELETE CASCADE;