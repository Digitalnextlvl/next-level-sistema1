import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface TeamApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  telefone: string;
  email: string;
  sobre: string;
  objetivo: string;
}

const steps = [
  { key: 'telefone', title: 'Seu Telefone', placeholder: '(11) 99999-9999' },
  { key: 'email', title: 'Seu Email', placeholder: 'seu@gmail.com' },
  { key: 'sobre', title: 'Sobre Você', placeholder: 'Conte um pouco sobre sua experiência...' },
  { key: 'objetivo', title: 'Seu Objetivo', placeholder: 'Por que quer fazer parte do time de vendas da Next Level?' }
];

export function TeamApplicationDialog({ open, onOpenChange }: TeamApplicationDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    telefone: '',
    email: '',
    sobre: '',
    objetivo: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const currentField = steps[currentStep].key as keyof FormData;
    if (!formData[currentField].trim()) {
      toast.error('Por favor, preencha este campo para continuar');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log('Team application submitted:', formData);
    toast.success('Aplicação enviada com sucesso! Entraremos em contato em breve.');
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(0);
    setFormData({
      telefone: '',
      email: '',
      sobre: '',
      objetivo: ''
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const currentValue = formData[currentStepData.key as keyof FormData];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-black border border-white/10 text-white p-0 overflow-hidden">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress indicator */}
          <div className="flex justify-between items-center p-6 pb-2">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-white' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-white/60 text-sm">
              {currentStep + 1} de {steps.length}
            </span>
          </div>

          <div className="p-6 pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <DialogTitle className="text-xl font-bold text-white">
                    {currentStepData.title}
                  </DialogTitle>
                  <p className="text-white/60 text-sm">
                    {currentStep === 0 && "Vamos começar com seu número de telefone"}
                    {currentStep === 1 && "Agora seu melhor email para contato"}
                    {currentStep === 2 && "Conte um pouco sobre sua experiência"}
                    {currentStep === 3 && "Por último, qual seu objetivo conosco?"}
                  </p>
                </div>

                <div className="space-y-4">
                  {currentStep < 2 ? (
                    <Input
                      type={currentStep === 1 ? 'email' : 'tel'}
                      placeholder={currentStepData.placeholder}
                      value={currentValue}
                      onChange={(e) => handleInputChange(currentStepData.key as keyof FormData, e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30"
                      autoFocus
                    />
                  ) : (
                    <Textarea
                      placeholder={currentStepData.placeholder}
                      value={currentValue}
                      onChange={(e) => handleInputChange(currentStepData.key as keyof FormData, e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 min-h-[120px] resize-none"
                      autoFocus
                    />
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  {currentStep > 0 && (
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    disabled={!currentValue.trim()}
                    className="flex-1 bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 flex items-center gap-2"
                  >
                    {isLastStep ? 'Enviar Aplicação' : 'Próximo'}
                    {!isLastStep && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}