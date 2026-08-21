import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Brand */}
        <Link to="/dashboard" className="navbar-brand">
          Expense Management
        </Link>

        {/* User Section */}
        {user && (
          <div className="navbar-links">

            <div className="navbar-user">
              <div className="navbar-user-icon">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <span>
                Welcome, {user.name}
              </span>
            </div>

            <button
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;