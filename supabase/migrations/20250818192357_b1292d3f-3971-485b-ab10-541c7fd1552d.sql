-- Add numero_contrato column if it doesn't exist (it should exist based on the schema)
-- This is just to ensure the column exists and add an index for performance

-- Create index for faster queries on numero_contrato
CREATE INDEX IF NOT EXISTS idx_contratos_numero_contrato ON public.contratos(numero_contrato);

-- Create index for faster queries by cliente_id for contract numbering
CREATE INDEX IF NOT EXISTS idx_contratos_cliente_id ON public.contratos(cliente_id);

-- Create function to generate next contract number for a client
CREATE OR REPLACE FUNCTION public.generate_contract_number(client_id uuid, client_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_number integer;
    formatted_number text;
BEGIN
    -- Get the highest contract number for this client
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN numero_contrato ~ '^Contrato ' || client_name || ' #[0-9]+$' 
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