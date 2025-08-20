-- Create candidaturas table for team applications
CREATE TABLE public.candidaturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  sobre_voce TEXT NOT NULL,
  objetivo_vendas TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.candidaturas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create candidaturas" 
ON public.candidaturas 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all candidaturas" 
ON public.candidaturas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update candidaturas status" 
ON public.candidaturas 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_candidaturas_updated_at
BEFORE UPDATE ON public.candidaturas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();