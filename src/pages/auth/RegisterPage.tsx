import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import { Heart, UserPlus, Briefcase } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "L'adresse email est invalide." }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
  role: z.enum(['parent', 'doctor'], { required_error: "Vous devez choisir un rôle." }),
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
    defaultValues: {
      role: 'parent',
    },
  });

  const selectedRole = watch('role');

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

      if (error) {
        throw new Error(error.message || "Une erreur s'est produite lors de l'inscription.");
      }
      
      if (signUpData.user?.identities?.length === 0) {
        throw new Error("Un utilisateur avec cet email existe déjà.");
      }

      toast.success("Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.");
      navigate('/login');

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">EpicTrack</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créez votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Déjà membre ?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Connectez-vous
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
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
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <Button type="submit" isLoading={isLoading}>
              Créer mon compte
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
