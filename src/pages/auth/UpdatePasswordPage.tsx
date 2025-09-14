import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import FaqItem from '../../components/auth/FaqItem';
import { KeyRound, AlertCircle } from 'lucide-react';

const passwordValidation = z.string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .regex(/[A-Z]/, "Doit contenir au moins une majuscule.")
  .regex(/[a-z]/, "Doit contenir au moins une minuscule.")
  .regex(/[0-9]/, "Doit contenir au moins un chiffre.");

const updatePasswordSchema = z.object({
  password: passwordValidation,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

const UpdatePasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // The session is now set, user can update their password
      } else {
        // Handle other events if necessary
      }
    });

    // Check for error in URL hash
    const hash = window.location.hash;
    if (hash.includes('error_description')) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDesc = params.get('error_description');
      setError(errorDesc || "Le lien de réinitialisation est invalide ou a expiré.");
    }

    return () => subscription.unsubscribe();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;

      toast.success("Votre mot de passe a été mis à jour avec succès !");
      navigate('/login');

    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const faqs = [
    { q: "Comment choisir un mot de passe fort ?", a: "Un mot de passe fort contient au moins 8 caractères, incluant des majuscules, des minuscules, des chiffres et des symboles. Évitez les informations personnelles évidentes." },
    { q: "Dois-je me reconnecter après avoir changé mon mot de passe ?", a: "Oui, pour des raisons de sécurité, vous serez redirigé vers la page de connexion pour vous authentifier avec votre nouveau mot de passe." },
  ];

  if (error) {
    return (
      <AuthLayout title="Erreur" description="Impossible de réinitialiser le mot de passe.">
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="w-12 h-12 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Créez votre nouveau mot de passe"
      description="Choisissez un mot de passe fort et sécurisé."
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <PasswordInput id="password" {...register('password')} />
          <PasswordStrengthIndicator password={password} />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
          <PasswordInput id="confirmPassword" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div>
          <Button type="submit" isLoading={isLoading} className="w-full">
            <KeyRound className="mr-2 h-5 w-5" />
            Mettre à jour le mot de passe
          </Button>
        </div>
      </form>
      
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Questions fréquentes</h3>
        <div className="space-y-2">
          {faqs.map((faq, i) => <FaqItem key={i} question={faq.q} answer={faq.a} />)}
        </div>
      </div>
    </AuthLayout>
  );
};

export default UpdatePasswordPage;
