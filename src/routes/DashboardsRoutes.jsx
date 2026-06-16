import { Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

import SuperAdminDashboard from "../dashboards/SuperAdmin/SuperAdminDashboard";
import AdminManagement from "../dashboards/SuperAdmin/AdminManagement";

// ================== ADMIN DASHBOARD ==================
import AdminDashboard from "../dashboards/AdminDashboard/AdminDashboard";
import AdminOverview from "../dashboards/AdminDashboard/Overview";
import AdminAgentManagement from "../dashboards/AdminDashboard/AgentManagement";
import AdminPropertyManagement from "../dashboards/AdminDashboard/PropertiesManagement";

// ================== AGENT DASHBOARD ==================
import AgentDashboard from "../dashboards/AgentDashboard/AgentDashboard";
import AgentOverview from "../dashboards/AgentDashboard/Overview";
import AgentProperties from "../dashboards/AgentDashboard/Properties";
import AgentClients from "../dashboards/AgentDashboard/Clients";
import AgentPayments from "../dashboards/AgentDashboard/Payment";
import AgentSettingsPage from "../dashboards/AgentDashboard/Settings";
import AgentReferralPage from "../dashboards/AgentDashboard/Referral";

// ================== VISITOR DASHBOARD ==================
import VisitorDashboard from "../dashboards/VisitorDashboard/VisitorDashboard";
import VisitorOverview from "../dashboards/VisitorDashboard/Overview";
import PropertiesPage from "../dashboards/VisitorDashboard/Properties";

import PurposePage from "../dashboards/VisitorDashboard/purposePage";

import AgentListings from "../dashboards/VisitorDashboard/AgentListing";

import AgentPropertiesDetails from '../dashboards/VisitorDashboard/AgentPropertiesDetails';

import SearchResultsPage from "../dashboards/VisitorDashboard/SearchResults";

import VisitorSettingsPage from "../dashboards/VisitorDashboard/Settings";

import ClientReferralPage from "../dashboards/VisitorDashboard/Referral";

import BuyerProfessionalsPage from "../dashboards/VisitorDashboard/Professionals"

import BuyerServiceProvidersPage from "../dashboards/VisitorDashboard/ServiceProvider"

import PaymentTab from "../dashboards/VisitorDashboard/Payments"

;





// ================== ROUTES ==================
const dashboardRoutes = [

  // ===== Super Admin =====
  {
    path: "super-admin-dashboard",
    element: (
      <ProtectedRoute allowedRoles={["superadmin"]}>
        <SuperAdminDashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: "overview/*", element: <AdminOverview /> },
      { path: "admins/", element: <AdminManagement /> },
    ],
  },
  // ===== Admin =====
  {
    path: "admin-dashboard",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: "overview/*", element: <AdminOverview /> },
      { path: "agents/", element: <AdminAgentManagement /> },
      { path: "properties/", element: <AdminPropertyManagement /> },
      
    ],
  },

  // ===== Agent =====
  {
    path: "agent-dashboard",
    element: (
      <ProtectedRoute allowedRoles={["agent"]}>
        <AgentDashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: "overview/*", element: <AgentOverview /> },
      { path: "properties/*", element: <AgentProperties /> },
      { path: "clients/*", element: <AgentClients /> },
      { path: "settings/*", element: <AgentSettingsPage /> },
      { path: "payments/*", element: <AgentPayments /> },
      {path: "referrals/*", element: <AgentReferralPage />},
    ],
  },


  // ===== Visitor =====
  {
    path: "visitor-dashboard",
    element: (
      <ProtectedRoute allowedRoles={["visitor"]}>
        <VisitorDashboard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: "overview/*", element: <VisitorOverview /> },
      { path: "properties/*", element: <PropertiesPage/> },
      { path: "purpose/*", element: <PurposePage /> },
      { path:"agents/:id/listings/*", element:<AgentListings />},
      {path:"properties/:id/*", element:<AgentPropertiesDetails />},
      {path: 'search', element: <SearchResultsPage />},
      { path: "settings/*", element: <VisitorSettingsPage /> },
      { path: "referrals/*", element: <ClientReferralPage /> },
      { path: "professionals/*", element: <BuyerProfessionalsPage /> },
      { path: "workers/*", element: <BuyerServiceProvidersPage /> },
       { path: "payments/*", element: <PaymentTab /> },
      
      
      
    ],
  },
]

export default dashboardRoutes;
