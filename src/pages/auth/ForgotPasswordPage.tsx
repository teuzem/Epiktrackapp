import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

import AuthLayout from '../../components/auth/AuthLayout';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import FaqItem from '../../components/auth/FaqItem';
import { Mail, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "L'adresse email est invalide." }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
      
      setIsSubmitted(true);

    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const faqs = [
    { q: "Je n'ai pas reçu l'email. Que faire ?", a: "Vérifiez votre dossier de courrier indésirable (spam). Si vous ne trouvez toujours rien après quelques minutes, essayez de soumettre à nouveau votre adresse email." },
    { q: "Le lien de réinitialisation a expiré.", a: "Les liens de réinitialisation de mot de passe sont valables pour une durée limitée. Veuillez refaire une demande via cette page pour en recevoir un nouveau." },
  ];

  return (
    <AuthLayout
      title="Mot de passe oublié ?"
      description={
        <>
          Vous vous souvenez de votre mot de passe ?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Connectez-vous
          </Link>
        </>
      }
    >
      {isSubmitted ? (
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-primary-600 mx-auto" />
          <h3 className="text-xl font-bold text-gray-900">Vérifiez vos emails</h3>
          <p className="text-gray-600">
            Si un compte existe pour <strong>{getValues("email")}</strong>, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
          </p>
          <Button onClick={() => setIsSubmitted(false)} variant="secondary">
            Renvoyer l'email
          </Button>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <p className="text-sm text-gray-600">
            Ne vous inquiétez pas. Entrez votre adresse email ci-dessous et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
          <div>
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="votre@email.com"
              {...register('email')}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              <Mail className="mr-2 h-5 w-5" />
              Envoyer le lien
            </Button>
          </div>
        </form>
      )}

      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Questions fréquentes</h3>
        <div className="space-y-2">
          {faqs.map((faq, i) => <FaqItem key={i} question={faq.q} answer={faq.a} />)}
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
