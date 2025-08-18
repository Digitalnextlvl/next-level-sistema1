-- Fix the security issue by properly setting search_path for the function
CREATE OR REPLACE FUNCTION public.generate_contract_number(client_id uuid, client_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    next_number integer;
    formatted_number text;
BEGIN
    -- Get the highest contract number for this client
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN numero_contrato ~ ('^Contrato ' || client_name || ' #[0-9]+$')
                THEN CAST(
                    regexp_replace(numero_contrato, '^Contrato ' || client_name || ' #([0-9]+)$', '\1')
                    AS integer
                )
                ELSE 0
            END
        ), 0
    ) + 1 INTO next_number
    FROM public.contratos 
    WHERE cliente_id = client_id;
    
    -- Format the number with leading zeros
    formatted_number := LPAD(next_number::text, 3, '0');
    
    -- Return the full contract name
    RETURN 'Contrato ' || client_name || ' #' || formatted_number;
END;
$$;