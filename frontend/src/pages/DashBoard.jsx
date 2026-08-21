import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import CreateGroup from "../components/CreateGroup";

import "../styles/dashboard.css";

function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      setError("");

      const response = await api.get("/groups");

      console.log("Groups response:", response.data);

      setGroups(response.data.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load groups. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  if (authLoading) {
    return (
      <div className="loading-screen">
        Loading user...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        Loading groups...
      </div>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">

        {/* Header */}
        <section className="dashboard-header">
          <div>
            <p className="dashboard-label">
              EXPENSE MANAGEMENT
            </p>

            <h1>Dashboard</h1>

            <p className="dashboard-welcome">
              Welcome back,{" "}
              <span>{user?.name}</span> 👋
            </p>
          </div>
        </section>

        {/* Create Group */}
        <section className="create-group-card">
          <div className="create-group-heading">
            <div>
              <h2>Create a New Group</h2>

              <p>
                Start sharing expenses with your friends,
                family or team.
              </p>
            </div>

            <div className="create-group-icon">
              +
            </div>
          </div>

          <CreateGroup onGroupCreated={fetchGroups} />
        </section>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Groups */}
        <section className="groups-section">

          <div className="groups-heading">
            <div>
              <h2>Your Groups</h2>

              <p>
                Select a group to manage its expenses.
              </p>
            </div>

            <span className="group-count">
              {
                groups.filter(
                  (group) => group.groupId
                ).length
              }{" "}
              Groups
            </span>
          </div>

          {groups.length === 0 ? (
            <div className="empty-state">

              <div className="empty-state-icon">
                📁
              </div>

              <h3>No groups yet</h3>

              <p>
                Create your first group to start
                managing shared expenses.
              </p>

            </div>
          ) : (
            <div className="group-grid">

              {groups.map((groupMember) => {

                if (!groupMember.groupId) {
                  return null;
                }

                const group =
                  groupMember.groupId;

                return (
                  <div
                    className="group-card"
                    key={groupMember._id}
                    onClick={() =>
                      navigate(
                        `/groups/${group._id}`
                      )
                    }
                  >

                    {/* Top */}
                    <div className="group-card-top">

                      <div className="group-icon">
                        {group.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span
                        className={`role-badge ${
                          groupMember.role === "ADMIN"
                            ? "admin"
                            : ""
                        }`}
                      >
                        {groupMember.role}
                      </span>

                    </div>

                    {/* Group name */}
                    <h3>{group.name}</h3>

                    {/* Currency */}
                    <p className="group-currency">
                      Currency:{" "}
                      <strong>
                        {group.currency}
                      </strong>
                    </p>

                    {/* Bottom */}
                    <div className="group-card-footer">
                      <span>
                        View Group
                      </span>

                      <span className="arrow">
                        →
                      </span>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

export default Dashboard;