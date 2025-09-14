import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'

// Layout Components
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import MobileBottomNav from './components/layout/MobileBottomNav'

// Page Components
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
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

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          
          <main className="flex-1 pt-16 pb-20 lg:pb-0">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Parent Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/children" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ChildrenPage />
                </ProtectedRoute>
              } />
              <Route path="/children/new" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <NewChildPage />
                </ProtectedRoute>
              } />
              <Route path="/children/edit/:id" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <EditChildPage />
                </ProtectedRoute>
              } />
              <Route path="/prediction/start" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <PredictionStartPage />
                </ProtectedRoute>
              } />
              <Route path="/prediction/:childId" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <PredictionPage />
                </ProtectedRoute>
              } />
              <Route path="/prediction/result/:predictionId" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <PredictionResultPage />
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <AppointmentsPage />
                </ProtectedRoute>
              } />
              <Route path="/appointments/new" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <NewAppointmentPage />
                </ProtectedRoute>
              } />
              <Route path="/payment/success/:appointmentId" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              } />
              
              {/* Protected Doctor Routes */}
              <Route path="/doctor/dashboard" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/doctor/patients" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes Patients</h1>
                    <div className="bg-white rounded-lg shadow p-6">
                      <p className="text-gray-600">Liste des patients à venir...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/doctor/appointments" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes Consultations</h1>
                    <div className="bg-white rounded-lg shadow p-6">
                      <p className="text-gray-600">Liste des consultations à venir...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Shared Protected Routes */}
              <Route path="/messages" element={
                <ProtectedRoute allowedRoles={['parent', 'doctor']}>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              <Route path="/consultation/:appointmentId" element={
                <ProtectedRoute allowedRoles={['parent', 'doctor']}>
                  <VideoCallPage />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <Footer />
          <MobileBottomNav />
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
