import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import FaqItem from '../../components/auth/FaqItem';
import { LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "L'adresse email est invalide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const from = location.state?.from?.pathname || (profile?.role === 'doctor' ? '/doctor/dashboard' : '/dashboard');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error("Email ou mot de passe incorrect.");
      }
      
      toast.success('Connexion réussie ! Redirection...');
      navigate(from, { replace: true });

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const faqs = [
    { q: "J'ai oublié mon mot de passe. Que faire ?", a: "Cliquez sur 'Mot de passe oublié ?' ci-dessous. Vous recevrez un email pour réinitialiser votre mot de passe." },
    { q: "Puis-je utiliser le même compte pour un profil Parent et Médecin ?", a: "Non, chaque rôle nécessite un compte séparé avec une adresse email unique pour des raisons de sécurité et de séparation des données." },
    { q: "La connexion est-elle sécurisée ?", a: "Oui, toutes les communications sont chiffrées via HTTPS et nous suivons les meilleures pratiques de sécurité pour protéger vos informations." },
  ];

  return (
    <AuthLayout
      title="Ravi de vous revoir"
      description={
        <>
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Inscrivez-vous
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
          <Label htmlFor="password">Mot de passe</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            {...register('password')}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <Label htmlFor="rememberMe" className="ml-2 !mb-0 text-sm text-gray-900">
              Rester connecté
            </Label>
          </div>
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <div>
          <Button type="submit" isLoading={isLoading} className="w-full">
            <LogIn className="mr-2 h-5 w-5" />
            Se connecter
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

export default LoginPage;
