import {
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/login";
import Cams from "./pages/Cams";
import Dashboard from "./pages/Dashboard";
import Banking from "./pages/Banking";
import Insurance from "./pages/Insurance";

import "./App.css";

/* ---------------- Login Protection ---------------- */

function LoginProtected({ children }) {
  const user = localStorage.getItem("userId");

  if (!user) return <Navigate to="/" replace />;

  return children;
}

/* ---------------- CAMS Protection ---------------- */

function DashboardProtected({ children }) {
  const consent = localStorage.getItem("camsConsent");

  if (!consent) return <Navigate to="/cams" replace />;

  return children;
}

/* ---------------- Sidebar ---------------- */

function AppShell({ children }) {
  const navigate = useNavigate();

  const fullname =
    localStorage.getItem("fullname") || "Kunal Labdhi";

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">L</div>

          <div>
            <p className="eyebrow">Labdhi Banking</p>
            <h2>Finance Hub</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/banking"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Banking
          </NavLink>

          <NavLink
            to="/insurance"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Insurance
          </NavLink>
        </nav>

        <div className="profile-card">
          <span className="status-dot"></span>

          <div>
            <strong>{fullname}</strong>
            <small>FIU Customer</small>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-panel">{children}</main>
    </div>
  );
}

/* ---------------- App ---------------- */

export default function App() {
  return (
    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* CAMS Consent Page */}
      <Route
        path="/cams"
        element={
          <LoginProtected>
            <Cams />
          </LoginProtected>
        }
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <LoginProtected>
            <DashboardProtected>
              <AppShell>
                <Dashboard />
              </AppShell>
            </DashboardProtected>
          </LoginProtected>
        }
      />

      {/* Banking */}
      <Route
        path="/banking"
        element={
          <LoginProtected>
            <DashboardProtected>
              <AppShell>
                <Banking />
              </AppShell>
            </DashboardProtected>
          </LoginProtected>
        }
      />

      {/* Insurance */}
      <Route
        path="/insurance"
        element={
          <LoginProtected>
            <DashboardProtected>
              <AppShell>
                <Insurance />
              </AppShell>
            </DashboardProtected>
          </LoginProtected>
        }
      />

      {/* Invalid URL */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}