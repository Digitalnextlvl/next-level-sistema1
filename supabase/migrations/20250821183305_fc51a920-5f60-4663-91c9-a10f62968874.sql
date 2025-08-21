-- Criar tabela de eventos locais
CREATE TABLE public.eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  local TEXT,
  google_event_id TEXT,
  tipo TEXT NOT NULL DEFAULT 'local',
  cor TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can create their own eventos" 
ON public.eventos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own eventos" 
ON public.eventos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own eventos" 
ON public.eventos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own eventos" 
ON public.eventos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar trigger para updated_at
CREATE TRIGGER update_eventos_updated_at
BEFORE UPDATE ON public.eventos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_eventos_user_id ON public.eventos(user_id);
CREATE INDEX idx_eventos_data_inicio ON public.eventos(data_inicio);
CREATE INDEX idx_eventos_google_event_id ON public.eventos(google_event_id);