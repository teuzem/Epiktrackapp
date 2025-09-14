import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Maps static paths to French names
const pathTranslations: { [key: string]: string } = {
  '/': 'Accueil',
  '/login': 'Connexion',
  '/register': 'Inscription',
  '/forgot-password': 'Mot de passe oublié',
  '/update-password': 'Mettre à jour le mot de passe',
  '/dashboard': 'Tableau de bord',
  '/children': 'Mes Enfants',
  '/children/new': 'Ajouter un enfant',
  '/children/edit': 'Modifier le profil',
  '/prediction': 'Prédiction',
  '/prediction/start': 'Lancer une prédiction',
  '/prediction/result': 'Résultat',
  '/appointments': 'Mes Rendez-vous',
  '/appointments/new': 'Nouveau rendez-vous',
  '/payment/success': 'Paiement réussi',
  '/messages': 'Messagerie',
  '/consultation': 'Consultation',
  '/doctor/dashboard': 'Tableau de bord Docteur',
  '/doctor/patients': 'Mes Patients',
  '/doctor/appointments': 'Mes Consultations',
  '/about': 'À Propos',
  '/features': 'Fonctionnalités',
  '/testimonials': 'Témoignages',
  '/contact': 'Contact',
  '/privacy': 'Politique de Confidentialité',
  '/terms': 'Conditions d\'utilisation',
  '/legal': 'Mentions Légales',
  '/profile': 'Profil',
  '/doctor/profile': 'Profil',
};

export interface Breadcrumb {
  path: string;
  name: string;
}

export const useBreadcrumbs = (): Breadcrumb[] => {
  const location = useLocation();
  const params = useParams();
  const { profile } = useAuth();
  const [dynamicNames, setDynamicNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchDynamicNames = async () => {
      const newDynamicNames: { [key: string]: string } = {};
      if (params.id && location.pathname.includes('/children/edit')) {
        const { data } = await supabase.from('children').select('first_name').eq('id', params.id).single();
        if (data) newDynamicNames[params.id] = data.first_name;
      }
      if (params.childId && location.pathname.includes('/prediction/')) {
        const { data } = await supabase.from('children').select('first_name').eq('id', params.childId).single();
        if (data) newDynamicNames[params.childId] = data.first_name;
      }
      // Add more dynamic fetches here as needed
      setDynamicNames(newDynamicNames);
    };
    fetchDynamicNames();
  }, [params, location.pathname]);

  const pathnames = location.pathname.split('/').filter(x => x);
  
  let breadcrumbs: Breadcrumb[] = [{ path: '/', name: 'Accueil' }];

  // Special handling for dashboard routes
  if (location.pathname.startsWith('/doctor/dashboard')) {
    breadcrumbs = [{ path: '/doctor/dashboard', name: 'Tableau de bord Docteur' }];
  } else if (location.pathname.startsWith('/dashboard')) {
    breadcrumbs = [{ path: '/dashboard', name: 'Tableau de bord' }];
  }
  
  let currentPath = '';
  pathnames.forEach((value, index) => {
    currentPath += `/${value}`;
    const name = dynamicNames[value] || pathTranslations[currentPath] || value.replace(/-/g, ' ');
    
    // Avoid duplicating dashboard entry
    if (currentPath === '/dashboard' && breadcrumbs[0].path === '/dashboard') return;
    if (currentPath === '/doctor/dashboard' && breadcrumbs[0].path === '/doctor/dashboard') return;

    // Avoid adding the dynamic ID itself as a breadcrumb name
    if (Object.keys(params).some(paramKey => params[paramKey] === value)) {
       if (index === pathnames.length - 1) { // If it's the last part, show the translated parent
         const parentPath = pathnames.slice(0, index).join('/');
         const parentName = pathTranslations[`/${parentPath}`] || value;
         if (!breadcrumbs.find(b => b.name === parentName)) {
            breadcrumbs.push({ path: currentPath, name: parentName });
         }
       }
       return;
    }

    if (name && !breadcrumbs.find(b => b.path === currentPath)) {
      breadcrumbs.push({ path: currentPath, name });
    }
  });

  return breadcrumbs;
};
