-- First ensure all users have a "Venda" category
INSERT INTO public.categorias_financeiras (user_id, nome, tipo, cor, ativo)
SELECT DISTINCT v.user_id, 'Venda', 'receita', '#10B981', true
FROM public.vendas v
WHERE NOT EXISTS (
    SELECT 1 FROM public.categorias_financeiras cf 
    WHERE cf.user_id = v.user_id AND cf.tipo = 'receita' AND cf.nome ILIKE 'venda'
);

-- Now create financial transactions for existing sales that don't have them
INSERT INTO public.transacoes_financeiras (
    user_id,
    tipo,
    data_transacao,
    descricao,
    valor,
    categoria_id,
    venda_id
)
SELECT 
    v.user_id,
    'receita',
    v.data_venda,
    'Receita da venda para cliente ID: ' || v.cliente_id,
    v.valor,
    cf.id as categoria_id,
    v.id
FROM public.vendas v
LEFT JOIN public.transacoes_financeiras t ON v.id = t.venda_id
INNER JOIN public.categorias_financeiras cf ON cf.user_id = v.user_id AND cf.tipo = 'receita' AND cf.nome ILIKE 'venda'
WHERE t.id IS NULL;