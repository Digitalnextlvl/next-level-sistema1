-- Update the trigger function to include client name in the description
CREATE OR REPLACE FUNCTION public.create_financial_transaction_from_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    categoria_venda_id uuid;
    cliente_nome text;
BEGIN
    -- Get the client name
    SELECT nome INTO cliente_nome
    FROM public.clientes
    WHERE id = NEW.cliente_id;
    
    -- Find or create the "Venda" category for this user
    SELECT id INTO categoria_venda_id
    FROM public.categorias_financeiras
    WHERE user_id = NEW.user_id 
    AND tipo = 'receita' 
    AND nome ILIKE 'venda'
    LIMIT 1;
    
    -- If no "Venda" category exists for this user, create one
    IF categoria_venda_id IS NULL THEN
        INSERT INTO public.categorias_financeiras (user_id, nome, tipo, cor, ativo)
        VALUES (NEW.user_id, 'Venda', 'receita', '#10B981', true)
        RETURNING id INTO categoria_venda_id;
    END IF;
    
    -- Create the financial transaction with client name
    INSERT INTO public.transacoes_financeiras (
        user_id,
        tipo,
        data_transacao,
        descricao,
        valor,
        categoria_id,
        venda_id
    ) VALUES (
        NEW.user_id,
        'receita',
        NEW.data_venda,
        'Receita da venda para cliente ' || COALESCE(cliente_nome, 'Cliente não encontrado'),
        NEW.valor,
        categoria_venda_id,
        NEW.id
    );
    
    RETURN NEW;
END;
$$;

-- Update the function for updating sales
CREATE OR REPLACE FUNCTION public.update_financial_transaction_from_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    cliente_nome text;
BEGIN
    -- Update the existing financial transaction if the sale value changed
    IF OLD.valor != NEW.valor OR OLD.data_venda != NEW.data_venda OR OLD.cliente_id != NEW.cliente_id THEN
        -- Get the client name
        SELECT nome INTO cliente_nome
        FROM public.clientes
        WHERE id = NEW.cliente_id;
        
        UPDATE public.transacoes_financeiras
        SET 
            valor = NEW.valor,
            data_transacao = NEW.data_venda,
            descricao = 'Receita da venda para cliente ' || COALESCE(cliente_nome, 'Cliente não encontrado')
        WHERE venda_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;