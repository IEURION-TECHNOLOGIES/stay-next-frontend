// src/routes/authRoutes.js
import { Navigate } from 'react-router-dom';

import SuperAdminLogin from '../pages/authPages/SuperAdminLogin';
import Login from '../pages/authPages/Login';
import RegistrationSuccessModal from '../pages/authPages/Success'
import VerifyEmail from '../pages/authPages/VerifyEmail';
import Register from '../pages/authPages/Register';
import AdminLogin from '../pages/authPages/AdminLogin';
import ForgotPassword from '../pages/authPages/ForgotPassword';
import ResetPassword from '../pages/authPages/ResetPassword';
import AgentVerification from '../pages/authPages/AgentVerify';
import VerificationStatus from '../pages/authPages/VerificationStatus';
import AgencyRegistration from '../pages/authPages/AgencyVerify';
import VisitorProfilePage from '../pages/authPages/Clientmore'
import SelectRole from '../pages/authPages/selectRole';
import PolicyPage from '../pages/authPages/policyPage'
import GuestRoute from '../components/GuestRoute';
import ProtectedRoute from '../components/ProtectedRoute';
import ProfessionalComingSoon from '../pages/authPages/Professional'
import HotelComingSoon from '../pages/authPages/Hotel'
import ServiceProviderPortal from '../pages/authPages/HandymanMore'

const authRoutes = [
     { 
    path: "/super-admin/login",
    element: (
      <GuestRoute>
        <SuperAdminLogin />
      </GuestRoute>
    ),
  },

  { 
    path: "/login",
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  { 
    path: "/register", 
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  { 
    path: "/register-success", 
    element: (
      <GuestRoute>
        <RegistrationSuccessModal />
      </GuestRoute>
    ),
  },
   { 
    path: "/admin/login",
    element: (
      <GuestRoute>
        <AdminLogin />
      </GuestRoute>
    ),
  },

    {
    path: '/visitor-more',
    element: (
      <ProtectedRoute>
        <VisitorProfilePage />
      </ProtectedRoute>
    ),
  },

  {
    path: '/set-role',
    element: (
      <ProtectedRoute>
        <SelectRole />
      </ProtectedRoute>
    ),
  },

   {
    path: '/policy',
    element: (
      <ProtectedRoute>
        <PolicyPage />
      </ProtectedRoute>
    ),
  },

  {
    path: '/agent-verification',
    element: (
      <ProtectedRoute>
        <AgentVerification />
      </ProtectedRoute>
    ),
  },

   {
    path: '/verification-status',
    element: (
      <ProtectedRoute>
        <VerificationStatus />
      </ProtectedRoute>
    ),
  },

    {
    path: '/agency-verification',
    element: (
      <ProtectedRoute>
        <AgencyRegistration />
      </ProtectedRoute>
    ),
  },

     {
    path: '/hotel-verification',
    element: (
      <ProtectedRoute>
        <HotelComingSoon />
      </ProtectedRoute>
    ),
  },

    {
    path: '/professional-verification',
    element: (
      <ProtectedRoute>
        <ProfessionalComingSoon />
      </ProtectedRoute>
    ),
  },

   {
    path: '/service-verification',
    element: (
      <ProtectedRoute>
        <ServiceProviderPortal />
      </ProtectedRoute>
    ),
  },

  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password/:token', element: <ResetPassword /> },
  
{ 
  path: '/verify-email', 
  element: <VerifyEmail />, // Public route, no wrapper
},



  { path: '/unauthorized', element: <div>Unauthorized</div> },
];

export default authRoutes;
