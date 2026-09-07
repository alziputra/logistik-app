import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import SessionTimeoutModal from "./Common/SessionTimeoutModal";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleTimeout = async () => {
    await logout("SESSION_TIMEOUT");
    navigate("/login?reason=session_timeout", { replace: true });
  };

  const { isWarningOpen, secondsRemaining, resetTimer } = useSessionTimeout({
    enabled: isAuthenticated,
    onTimeout: handleTimeout,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Memuat Sistem Logistik...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <SessionTimeoutModal isOpen={isWarningOpen} secondsRemaining={secondsRemaining} onExtend={resetTimer} onLogout={handleTimeout} />
      <Outlet />
    </>
  );
};

export default ProtectedRoute;
