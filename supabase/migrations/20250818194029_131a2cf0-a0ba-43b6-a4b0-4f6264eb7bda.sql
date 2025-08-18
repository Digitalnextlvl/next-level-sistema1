-- Update existing financial transactions to show client name instead of ID
UPDATE public.transacoes_financeiras 
SET descricao = 'Receita da venda para cliente ' || COALESCE(c.nome, 'Cliente não encontrado')
FROM public.vendas v
LEFT JOIN public.clientes c ON v.cliente_id = c.id
WHERE public.transacoes_financeiras.venda_id = v.id
AND public.transacoes_financeiras.descricao LIKE 'Receita da venda para cliente ID:%';