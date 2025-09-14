import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Breadcrumbs from './Breadcrumbs';
import MobileBottomNav from './MobileBottomNav';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const authRoutes = ['/login', '/register', '/forgot-password', '/update-password'];
  const isAuthPage = authRoutes.includes(location.pathname);
  const publicPages = ['/', '/about', '/features', '/testimonials', '/contact', '/privacy', '/terms', '/legal'];
  const isPublicPage = publicPages.includes(location.pathname) || location.pathname.startsWith('/#');

  // Show bottom nav only on authenticated app pages, not on public or auth pages
  const showBottomNav = user && !isPublicPage && !isAuthPage;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <Breadcrumbs />
        <div className={showBottomNav ? 'pb-20 lg:pb-0' : ''}>
          <Outlet />
        </div>
      </main>
      {showBottomNav && <MobileBottomNav />}
      <Footer />
    </div>
  );
};

export default MainLayout;
