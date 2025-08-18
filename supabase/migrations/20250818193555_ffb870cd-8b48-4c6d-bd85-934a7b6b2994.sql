-- Create function to automatically create financial transaction when a sale is created
CREATE OR REPLACE FUNCTION public.create_financial_transaction_from_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    categoria_venda_id uuid;
BEGIN
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
    
    -- Create the financial transaction
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
        'Receita da venda para cliente ID: ' || NEW.cliente_id,
        NEW.valor,
        categoria_venda_id,
        NEW.id
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically create financial transaction when a sale is inserted
CREATE OR REPLACE TRIGGER trigger_create_financial_transaction_from_sale
    AFTER INSERT ON public.vendas
    FOR EACH ROW
    EXECUTE FUNCTION public.create_financial_transaction_from_sale();

-- Also create trigger for when sale is updated (in case the value changes)
CREATE OR REPLACE FUNCTION public.update_financial_transaction_from_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Update the existing financial transaction if the sale value changed
    IF OLD.valor != NEW.valor OR OLD.data_venda != NEW.data_venda THEN
        UPDATE public.transacoes_financeiras
        SET 
            valor = NEW.valor,
            data_transacao = NEW.data_venda,
            descricao = 'Receita da venda para cliente ID: ' || NEW.cliente_id
        WHERE venda_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_update_financial_transaction_from_sale
    AFTER UPDATE ON public.vendas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_financial_transaction_from_sale();

-- Create trigger for when sale is deleted
CREATE OR REPLACE FUNCTION public.delete_financial_transaction_from_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Delete the associated financial transaction
    DELETE FROM public.transacoes_financeiras
    WHERE venda_id = OLD.id;
    
    RETURN OLD;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_delete_financial_transaction_from_sale
    AFTER DELETE ON public.vendas
    FOR EACH ROW
    EXECUTE FUNCTION public.delete_financial_transaction_from_sale();