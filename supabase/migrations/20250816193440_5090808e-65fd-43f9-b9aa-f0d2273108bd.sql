-- Criar perfil para usuário existente se necessário
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Buscar usuário pelo email
    SELECT id, email, raw_user_meta_data 
    FROM auth.users 
    WHERE email = 'conteudocbb@gmail.com' 
    INTO user_record;
    
    -- Se encontrou o usuário e ele não tem perfil, criar um
    IF user_record.id IS NOT NULL THEN
        INSERT INTO public.profiles (user_id, name, role, created_at, updated_at)
        VALUES (
            user_record.id,
            COALESCE(user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)),
            'admin',
            now(),
            now()
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    -- Fazer o mesmo para o outro usuário nos logs
    SELECT id, email, raw_user_meta_data 
    FROM auth.users 
    WHERE email = 'foundersclub.suporte@gmail.com' 
    INTO user_record;
    
    IF user_record.id IS NOT NULL THEN
        INSERT INTO public.profiles (user_id, name, role, created_at, updated_at)
        VALUES (
            user_record.id,
            COALESCE(user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)),
            'admin',
            now(),
            now()
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;