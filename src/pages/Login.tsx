import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "This service has transformed how I work. Clean design, powerful features, and excellent support."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity."
  },
];

export default function Login() {
  const { user, login, signup, resetPassword, isLoading } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      if (mode === 'signin') {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || "Email ou senha inválidos");
        }
      } else if (mode === 'signup') {
        const result = await signup(email, password, name);
        if (result.success) {
          setSuccess("Conta criada! Verifique seu email para confirmar.");
          setMode('signin');
        } else {
          setError(result.error || "Erro ao criar conta");
        }
      } else if (mode === 'reset') {
        const result = await resetPassword(email);
        if (result.success) {
          setSuccess("Email de redefinição enviado!");
          setMode('signin');
        } else {
          setError(result.error || "Erro ao enviar email");
        }
      }
    } catch (error) {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Google Sign In implementation would go here
  };

  const handleResetPassword = () => {
    setMode('reset');
    setError("");
    setSuccess("");
  };

  const handleCreateAccount = () => {
    setMode(mode === 'signup' ? 'signin' : 'signup');
    setError("");
    setSuccess("");
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return "Criar Conta";
      case 'reset': return "Redefinir Senha";
      default: return "Bem-vindo";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signup': return "Crie sua conta e comece sua jornada conosco";
      case 'reset': return "Digite seu email para redefinir sua senha";
      default: return "Acesse sua conta e continue sua jornada conosco";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg">
          {success}
        </div>
      )}
      
      <SignInPage
        title={getTitle()}
        description={getDescription()}
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={[]}
        onSignIn={handleSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        mode={mode}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}