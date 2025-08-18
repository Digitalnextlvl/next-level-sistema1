-- Create financial transactions for existing sales that don't have them
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
    COALESCE(
        (SELECT id FROM public.categorias_financeiras 
         WHERE user_id = v.user_id AND tipo = 'receita' AND nome ILIKE 'venda' 
         LIMIT 1),
        (SELECT id FROM 
         (INSERT INTO public.categorias_financeiras (user_id, nome, tipo, cor, ativo)
          SELECT v.user_id, 'Venda', 'receita', '#10B981', true
          WHERE NOT EXISTS (
              SELECT 1 FROM public.categorias_financeiras 
              WHERE user_id = v.user_id AND tipo = 'receita' AND nome ILIKE 'venda'
          )
          RETURNING id) AS new_cat)
    ) as categoria_id,
    v.id
FROM public.vendas v
LEFT JOIN public.transacoes_financeiras t ON v.id = t.venda_id
WHERE t.id IS NULL;