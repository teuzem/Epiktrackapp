import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Heart, Calendar, MessageCircle, User, Stethoscope, Users, BarChart3, Info, Phone, Bot } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const MobileBottomNav: React.FC = () => {
  const location = useLocation()
  const { user, profile } = useAuth()

  const publicNavItems = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Fonctionnalités', href: '/features', icon: Bot },
    { name: 'Contact', href: '/contact', icon: Phone },
    { name: 'Connexion', href: '/login', icon: User },
  ];

  const parentNavItems = [
    { name: 'Accueil', href: '/dashboard', icon: Home },
    { name: 'Enfants', href: '/children', icon: Heart },
    { name: 'Rendez-vous', href: '/appointments', icon: Calendar },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Profil', href: '/profile', icon: User },
  ];

  const doctorNavItems = [
    { name: 'Tableau de bord', href: '/doctor/dashboard', icon: BarChart3 },
    { name: 'Patients', href: '/doctor/patients', icon: Users },
    { name: 'Consultations', href: '/doctor/appointments', icon: Stethoscope },
    { name: 'Messages', href: '/messages', icon: MessageCircle },
    { name: 'Profil', href: '/doctor/profile', icon: User },
  ];

  let navItems;
  if (user && profile) {
    navItems = profile.role === 'doctor' ? doctorNavItems : parentNavItems;
  } else {
    navItems = publicNavItems;
  }
  
  const authRoutes = ['/login', '/register', '/forgot-password', '/update-password'];
  if (authRoutes.includes(location.pathname)) {
    return null; // Do not show nav on auth pages
  }

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                active ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" strokeWidth={active ? 2.5 : 2} />
              <span className={`text-xs font-medium ${active ? 'font-bold' : ''}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
