import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
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

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof CandidaturaData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step: number) => {
    console.log(`Validando step ${step}:`, formData);
    switch (step) {
      case 1:
        const step1Valid = formData.nome.trim() && formData.email.trim() && formData.telefone.trim();
        console.log('Step 1 válido:', step1Valid);
        return step1Valid;
      case 2:
        const step2Valid = formData.sobre_voce.trim().length >= 50;
        console.log('Step 2 válido:', step2Valid, 'chars:', formData.sobre_voce.length);
        return step2Valid;
      case 3:
        const step3Valid = formData.objetivo_vendas.trim().length >= 50;
        console.log('Step 3 válido:', step3Valid, 'chars:', formData.objetivo_vendas.length);
        return step3Valid;
      case 4:
        return true;
      default:
        return false;
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

  const slideVariants = {
    enter: {
      x: 300,
      opacity: 0
    },
    center: {
      x: 0,
      opacity: 1
    },
    exit: {
      x: -300,
      opacity: 0
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <VisuallyHidden>
          <DialogTitle>Formulário de Candidatura</DialogTitle>
          <DialogDescription>
            Preencha este formulário de 4 etapas para se candidatar à nossa equipe de vendas
          </DialogDescription>
        </VisuallyHidden>
        <div className="flex flex-col h-full">
          {/* Header with progress */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Faça parte da nossa equipe</h2>
              <span className="text-sm text-muted-foreground">
                {currentStep} de {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  type: "tween",
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 p-6 overflow-y-auto"
              >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-semibold mb-2">Seus dados pessoais</h3>
                      <p className="text-muted-foreground">
                        Vamos começar com suas informações básicas
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome">Nome completo *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => updateFormData('nome', e.target.value)}
                          placeholder="Seu nome completo"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          placeholder="seu@email.com"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="telefone">Telefone *</Label>
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => updateFormData('telefone', e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-semibold mb-2">Conte-nos sobre você</h3>
                      <p className="text-muted-foreground">
                        Queremos conhecer você melhor. Fale sobre sua experiência e personalidade.
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="sobre_voce">Sobre você *</Label>
                      <Textarea
                        id="sobre_voce"
                        value={formData.sobre_voce}
                        onChange={(e) => updateFormData('sobre_voce', e.target.value)}
                        placeholder="Conte sobre sua experiência profissional, habilidades, o que te motiva e como você se descreve..."
                        className="mt-1 min-h-[200px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Mínimo 50 caracteres ({formData.sobre_voce.length}/50)
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-semibold mb-2">Seus objetivos em vendas</h3>
                      <p className="text-muted-foreground">
                        Por que você quer fazer parte do nosso time de vendas?
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="objetivo_vendas">Objetivo em fazer parte do time *</Label>
                      <Textarea
                        id="objetivo_vendas"
                        value={formData.objetivo_vendas}
                        onChange={(e) => updateFormData('objetivo_vendas', e.target.value)}
                        placeholder="Explique por que você quer fazer parte da Next Level, quais são seus objetivos profissionais e como pode contribuir com o time..."
                        className="mt-1 min-h-[200px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Mínimo 50 caracteres ({formData.objetivo_vendas.length}/50)
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-semibold mb-2">Revisar e enviar</h3>
                      <p className="text-muted-foreground">
                        Confira suas informações antes de enviar sua candidatura
                      </p>
                    </div>
                    
                    <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                      <div>
                        <strong>Nome:</strong> {formData.nome}
                      </div>
                      <div>
                        <strong>Email:</strong> {formData.email}
                      </div>
                      <div>
                        <strong>Telefone:</strong> {formData.telefone}
                      </div>
                      <div>
                        <strong>Sobre você:</strong>
                        <p className="mt-1 text-sm">{formData.sobre_voce}</p>
                      </div>
                      <div>
                        <strong>Objetivo em vendas:</strong>
                        <p className="mt-1 text-sm">{formData.objetivo_vendas}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer with navigation */}
          <div className="p-6 border-t flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="flex items-center gap-2"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2"
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