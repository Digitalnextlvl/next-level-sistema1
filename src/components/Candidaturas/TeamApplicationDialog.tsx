import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { useCandidaturas, type CandidaturaData } from '@/hooks/useCandidaturas';

interface TeamApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamApplicationDialog({ open, onOpenChange }: TeamApplicationDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CandidaturaData>({
    nome: '',
    email: '',
    telefone: '',
    sobre_voce: '',
    objetivo_vendas: '',
  });

  const { createCandidatura, isLoading } = useCandidaturas();

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof CandidaturaData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.nome.trim().length >= 2;
      case 2:
        return formData.email.trim().includes('@');
      case 3:
        return formData.telefone.trim().length >= 10;
      case 4:
        return formData.sobre_voce.trim().length >= 50;
      case 5:
        return formData.objetivo_vendas.trim().length >= 50;
      case 6:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && currentStep < 4) { // Don't auto-advance on textareas
      e.preventDefault();
      if (isStepValid(currentStep)) {
        handleNext();
      }
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('Enviando candidatura:', formData);
    const result = await createCandidatura(formData);
    if (result.success) {
      console.log('Candidatura enviada com sucesso');
      onOpenChange(false);
      // Reset form
      setCurrentStep(1);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        sobre_voce: '',
        objetivo_vendas: '',
      });
    } else {
      console.error('Erro ao enviar candidatura');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setCurrentStep(1);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      sobre_voce: '',
      objetivo_vendas: '',
    });
  };


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl w-full h-[100vh] sm:h-[90vh] overflow-hidden p-0 max-w-none sm:max-w-4xl">
        <div className="sr-only">
          <DialogTitle>Formulário de Candidatura</DialogTitle>
          <DialogDescription>
            Preencha este formulário para se candidatar à nossa equipe de vendas
          </DialogDescription>
        </div>
        
        <div className="flex flex-col h-full">
          {/* Progress bar - subtle and minimal */}
          <div className="px-6 pt-4">
            <Progress value={progress} className="h-1" />
          </div>

          {/* Main content area */}
          <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-2xl">
              
              {/* Step 1: Name */}
              {currentStep === 1 && (
                <div className="space-y-8 text-center sm:text-left">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                      Qual é o seu nome completo? ✋
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Vamos começar do básico - como podemos te chamar?
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      autoFocus
                      value={formData.nome}
                      onChange={(e) => updateFormData('nome', e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite seu nome completo"
                      className="text-xl p-6 border-2 bg-background/50 backdrop-blur-sm"
                    />
                    {formData.nome.length > 0 && formData.nome.length < 2 && (
                      <p className="text-sm text-destructive">Nome deve ter pelo menos 2 caracteres</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Email */}
              {currentStep === 2 && (
                <div className="space-y-8 text-center sm:text-left">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                      Qual é o seu email? 📧
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Precisamos do seu email para entrar em contato
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      autoFocus
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="seuemail@exemplo.com"
                      className="text-xl p-6 border-2 bg-background/50 backdrop-blur-sm"
                    />
                    {formData.email.length > 0 && !formData.email.includes('@') && (
                      <p className="text-sm text-destructive">Insira um email válido</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Phone */}
              {currentStep === 3 && (
                <div className="space-y-8 text-center sm:text-left">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                      Qual é o seu telefone? 📱
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      WhatsApp ou telefone para contato direto
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      autoFocus
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => updateFormData('telefone', e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="(11) 99999-9999"
                      className="text-xl p-6 border-2 bg-background/50 backdrop-blur-sm"
                    />
                    {formData.telefone.length > 0 && formData.telefone.length < 10 && (
                      <p className="text-sm text-destructive">Telefone deve ter pelo menos 10 dígitos</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: About You */}
              {currentStep === 4 && (
                <div className="space-y-8 text-center sm:text-left">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                      Conte-nos sobre você 🌟
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Sua experiência, personalidade, o que te motiva... Queremos te conhecer!
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea
                      autoFocus
                      value={formData.sobre_voce}
                      onChange={(e) => updateFormData('sobre_voce', e.target.value)}
                      placeholder="Fale sobre sua trajetória, experiências profissionais, o que você gosta de fazer, seus pontos fortes..."
                      className="text-lg p-6 border-2 bg-background/50 backdrop-blur-sm min-h-[200px] resize-none"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formData.sobre_voce.length >= 50 ? '✅ Perfeito!' : 'Mínimo 50 caracteres'}</span>
                      <span>{formData.sobre_voce.length}/50</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Sales Objective */}
              {currentStep === 5 && (
                <div className="space-y-8 text-center sm:text-left">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                      Por que quer fazer parte do nosso time? 🚀
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Quais são seus objetivos? Como você pode contribuir com a Next Level?
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea
                      autoFocus
                      value={formData.objetivo_vendas}
                      onChange={(e) => updateFormData('objetivo_vendas', e.target.value)}
                      placeholder="Explique seus objetivos profissionais, por que vendas te atrai, o que você pode trazer para o time..."
                      className="text-lg p-6 border-2 bg-background/50 backdrop-blur-sm min-h-[200px] resize-none"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formData.objetivo_vendas.length >= 50 ? '✅ Perfeito!' : 'Mínimo 50 caracteres'}</span>
                      <span>{formData.objetivo_vendas.length}/50</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Review */}
              {currentStep === 6 && (
                <div className="space-y-8 text-center sm:text-left">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                      Tudo certo! 🎉
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Vamos revisar suas informações antes de enviar
                    </p>
                  </div>
                  
                  <div className="space-y-6 bg-muted/30 p-6 rounded-lg text-left">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Nome</div>
                      <div className="text-lg">{formData.nome}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                      <div className="text-lg">{formData.email}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Telefone</div>
                      <div className="text-lg">{formData.telefone}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Sobre você</div>
                      <div className="text-base leading-relaxed">{formData.sobre_voce}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Seus objetivos</div>
                      <div className="text-base leading-relaxed">{formData.objetivo_vendas}</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer with navigation */}
          <div className="p-6 border-t flex justify-between items-center bg-background/80 backdrop-blur-sm">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                size="lg"
                className="flex items-center gap-2 px-8"
              >
                {currentStep < 3 ? 'OK' : 'Continuar'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                size="lg"
                className="flex items-center gap-2 px-8"
              >
                {isLoading ? (
                  <>Enviando...</>
                ) : (
                  <>
                    Enviar candidatura
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}