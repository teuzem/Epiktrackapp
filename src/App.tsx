import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'

// Layout Component
import MainLayout from './components/layout/MainLayout'

// Page Components
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage'
import Dashboard from './pages/dashboard/Dashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import ChildrenPage from './pages/children/ChildrenPage'
import NewChildPage from './pages/children/NewChildPage'
import EditChildPage from './pages/children/EditChildPage'
import PredictionStartPage from './pages/prediction/PredictionStartPage'
import PredictionPage from './pages/prediction/PredictionPage'
import PredictionResultPage from './pages/prediction/PredictionResultPage'
import AppointmentsPage from './pages/appointments/AppointmentsPage'
import NewAppointmentPage from './pages/appointments/NewAppointmentPage'
import PaymentSuccessPage from './pages/appointments/PaymentSuccessPage'
import MessagesPage from './pages/messages/MessagesPage'
import VideoCallPage from './pages/consultation/VideoCallPage'

// New & Updated Public Pages
import TeamPage from './pages/public/TeamPage'
import TeamMemberPage from './pages/public/TeamMemberPage'
import JoinTeamPage from './pages/public/JoinTeamPage'
import FeaturesPage from './pages/public/FeaturesPage'
import TestimonialsPage from './pages/public/TestimonialsPage'
import ContactPage from './pages/public/ContactPage'
import PrivacyPage from './pages/public/PrivacyPage'
import TermsPage from './pages/public/TermsPage'
import LegalPage from './pages/public/LegalPage'

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/team/:memberId" element={<TeamMemberPage />} />
          <Route path="/join-team" element={<JoinTeamPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/about" element={<Navigate to="/team" replace />} /> {/* Redirect old about page */}
          
          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          
          {/* Protected Parent Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['parent']}><Dashboard /></ProtectedRoute>} />
          <Route path="/children" element={<ProtectedRoute allowedRoles={['parent']}><ChildrenPage /></ProtectedRoute>} />
          <Route path="/children/new" element={<ProtectedRoute allowedRoles={['parent']}><NewChildPage /></ProtectedRoute>} />
          <Route path="/children/edit/:id" element={<ProtectedRoute allowedRoles={['parent']}><EditChildPage /></ProtectedRoute>} />
          <Route path="/prediction/start" element={<ProtectedRoute allowedRoles={['parent']}><PredictionStartPage /></ProtectedRoute>} />
          <Route path="/prediction/:childId" element={<ProtectedRoute allowedRoles={['parent']}><PredictionPage /></ProtectedRoute>} />
          <Route path="/prediction/result/:predictionId" element={<ProtectedRoute allowedRoles={['parent']}><PredictionResultPage /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute allowedRoles={['parent']}><AppointmentsPage /></ProtectedRoute>} />
          <Route path="/appointments/new" element={<ProtectedRoute allowedRoles={['parent']}><NewAppointmentPage /></ProtectedRoute>} />
          <Route path="/payment/success/:appointmentId" element={<ProtectedRoute allowedRoles={['parent']}><PaymentSuccessPage /></ProtectedRoute>} />
          
          {/* Protected Doctor Routes */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><div className="p-8">Mes Patients</div></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><div className="p-8">Mes Consultations</div></ProtectedRoute>} />
          
          {/* Shared Protected Routes */}
          <Route path="/messages" element={<ProtectedRoute allowedRoles={['parent', 'doctor']}><MessagesPage /></ProtectedRoute>} />
          <Route path="/consultation/:appointmentId" element={<ProtectedRoute allowedRoles={['parent', 'doctor']}><VideoCallPage /></ProtectedRoute>} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
          success: { style: { background: '#22c55e' } },
          error: { style: { background: '#ef4444' } },
        }}
      />
    </AuthProvider>
  )
}

export default App
