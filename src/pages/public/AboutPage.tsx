import React from 'react';
import { Navigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  // This page is now replaced by TeamPage. We redirect to maintain clean URLs.
  return <Navigate to="/team" replace />;
};

export default AboutPage;
