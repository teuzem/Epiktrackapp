import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import FaqItem from '../../components/auth/FaqItem';
import { UserPlus, Briefcase } from 'lucide-react';

const passwordValidation = z.string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .regex(/[A-Z]/, "Doit contenir au moins une majuscule.")
  .regex(/[a-z]/, "Doit contenir au moins une minuscule.")
  .regex(/[0-9]/, "Doit contenir au moins un chiffre.");

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères."),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  email: z.string().email("L'adresse email est invalide."),
  password: passwordValidation,
  confirmPassword: z.string(),
  role: z.enum(['parent', 'doctor'], { required_error: "Vous devez choisir un rôle." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'parent' },
  });

  const selectedRole = watch('role');
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        },
      });

      if (error) throw new Error(error.message);
      if (signUpData.user?.identities?.length === 0) throw new Error("Un utilisateur avec cet email existe déjà.");

      toast.success("Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.", { duration: 6000 });
      navigate('/login');

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const faqs = [
    { q: "Pourquoi dois-je confirmer mon email ?", a: "La confirmation par email est une étape de sécurité essentielle pour vérifier que vous êtes bien le propriétaire de l'adresse email et pour activer votre compte." },
    { q: "Quelles informations sont nécessaires pour un médecin ?", a: "Les médecins devront fournir des informations supplémentaires après l'inscription (numéro de licence, spécialisation, etc.) qui seront vérifiées par notre équipe pour garantir la qualité de notre service." },
    { q: "Mes données personnelles sont-elles en sécurité ?", a: "Absolument. Nous utilisons des protocoles de sécurité avancés et nous nous conformons aux réglementations sur la protection des données pour garantir la confidentialité de vos informations." },
  ];

  return (
    <AuthLayout
      title="Créez votre compte"
      description={
        <>
          Déjà membre ?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Connectez-vous
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label>Je suis un(e) :</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <input type="radio" id="role-parent" value="parent" {...register('role')} className="hidden" />
            <label
              htmlFor="role-parent"
              onClick={() => setValue('role', 'parent')}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedRole === 'parent' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}
            >
              <UserPlus className={`w-8 h-8 mb-2 ${selectedRole === 'parent' ? 'text-primary-600' : 'text-gray-500'}`} />
              <span className="font-medium">Parent</span>
            </label>

            <input type="radio" id="role-doctor" value="doctor" {...register('role')} className="hidden" />
            <label
              htmlFor="role-doctor"
              onClick={() => setValue('role', 'doctor')}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedRole === 'doctor' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}
            >
              <Briefcase className={`w-8 h-8 mb-2 ${selectedRole === 'doctor' ? 'text-primary-600' : 'text-gray-500'}`} />
              <span className="font-medium">Médecin</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" {...register('firstName')} />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" {...register('lastName')} />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Adresse email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <PasswordInput id="password" {...register('password')} />
          <PasswordStrengthIndicator password={password} />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <PasswordInput id="confirmPassword" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div>
          <Button type="submit" isLoading={isLoading} className="w-full">
            Créer mon compte
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

export default RegisterPage;
