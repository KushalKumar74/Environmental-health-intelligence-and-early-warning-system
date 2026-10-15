import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import AlertsPage from "@/pages/AlertsPage";
import ExposureHistoryPage from "@/pages/ExposureHistoryPage";
import GisMapPage from "@/pages/GisMapPage";
import FacilityDashboard from "@/pages/FacilityDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Predict from "@/pages/Predict";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/NotFound";
import { RecordsProvider } from "@/store/records";
import { ProfilesProvider } from "@/store/profiles";

const Index = () => (
  <RecordsProvider>
    <ProfilesProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="air-quality" element={<Navigate to="/" replace />} />
          <Route path="exposure" element={<Navigate to="/" replace />} />
          <Route path="forecast" element={<Navigate to="/" replace />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="events" element={<AlertsPage />} />
          <Route path="history" element={<ExposureHistoryPage />} />
          <Route path="gis-map" element={<GisMapPage />} />
          <Route path="facility-dashboard" element={<FacilityDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="predict" element={<Predict />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profiles" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ProfilesProvider>
  </RecordsProvider>
);

export default Index;
