import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

import StaticPageLayout from '../../components/layout/StaticPageLayout';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';

const joinTeamSchema = z.object({
  fullName: z.string().min(3, "Le nom complet est requis."),
  email: z.string().email("L'adresse email est invalide."),
  phone: z.string().optional(),
  roleAppliedFor: z.string().min(2, "Le poste souhaité est requis."),
  coverLetter: z.string().optional(),
});

type JoinTeamFormData = z.infer<typeof joinTeamSchema>;

const JoinTeamPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<JoinTeamFormData>({
    resolver: zodResolver(joinTeamSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Veuillez téléverser votre CV au format PDF.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("Le fichier ne doit pas dépasser 5 Mo.");
        return;
      }
      setCvFile(file);
    }
  };

  const onSubmit = async (data: JoinTeamFormData) => {
    if (!cvFile) {
      toast.error("Veuillez joindre votre CV.");
      return;
    }
    setIsLoading(true);
    try {
      // 1. Upload CV
      const fileExt = cvFile.name.split('.').pop();
      const filePath = `public/${data.fullName.replace(/\s+/g, '_')}_${new Date().getTime()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('team_applications_cvs')
        .upload(filePath, cvFile);
      if (uploadError) throw new Error(`Erreur d'upload du CV: ${uploadError.message}`);

      // 2. Get public URL
      const { data: urlData } = supabase.storage.from('team_applications_cvs').getPublicUrl(filePath);
      if (!urlData.publicUrl) throw new Error("Impossible de récupérer l'URL du CV.");

      // 3. Insert application data
      const { error: insertError } = await supabase.from('team_applications').insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        role_applied_for: data.roleAppliedFor,
        cv_url: urlData.publicUrl,
        cover_letter: data.coverLetter,
      });
      if (insertError) throw insertError;

      setIsSubmitted(true);

    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de la soumission.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <StaticPageLayout title="Candidature Envoyée !" subtitle="">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-primary-600 mx-auto mb-6" />
          <p className="text-xl text-gray-700 mb-8">Merci pour votre intérêt ! Votre candidature a bien été reçue. Notre équipe vous contactera si votre profil correspond à nos besoins.</p>
          <Button onClick={() => navigate('/team')}>Retour à la page équipe</Button>
        </div>
      </StaticPageLayout>
    );
  }

  return (
    <StaticPageLayout
      title="Rejoignez Notre Mission"
      subtitle="Vous êtes passionné(e) par la technologie et la santé ? Aidez-nous à changer des vies au Cameroun."
    >
      <div className="max-w-2xl mx-auto bg-gray-50 p-8 rounded-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">Nom complet *</Label>
              <Input id="fullName" {...register('fullName')} />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input id="phone" {...register('phone')} />
            </div>
            <div>
              <Label htmlFor="roleAppliedFor">Poste souhaité *</Label>
              <Input id="roleAppliedFor" {...register('roleAppliedFor')} />
              {errors.roleAppliedFor && <p className="text-red-500 text-sm mt-1">{errors.roleAppliedFor.message}</p>}
            </div>
          </div>
          <div>
            <Label>Votre CV (PDF, max 5Mo) *</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary-500"
            >
              <div className="space-y-1 text-center">
                {cvFile ? (
                  <FileText className="mx-auto h-12 w-12 text-primary-600" />
                ) : (
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <p className="pl-1">{cvFile ? cvFile.name : 'Cliquez pour téléverser votre CV'}</p>
                </div>
              </div>
            </div>
            <input id="cv-upload" ref={fileInputRef} name="cv-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
          </div>
          <div>
            <Label htmlFor="coverLetter">Lettre de motivation (optionnel)</Label>
            <textarea id="coverLetter" rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg" {...register('coverLetter')} />
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full">
            Soumettre ma candidature
          </Button>
        </form>
      </div>
    </StaticPageLayout>
  );
};

export default JoinTeamPage;
