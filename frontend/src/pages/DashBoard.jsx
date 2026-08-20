import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
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

    fetchGroups();
  }, []);

  if (authLoading) {
    return <h1>Loading user...</h1>;
  }

  if (loading) {
    return <h1>Loading groups...</h1>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <h2>Welcome, {user?.name}</h2>

      {error && <p>{error}</p>}

      <h3>Your Groups</h3>

      {groups.length === 0 ? (
        <p>You are not a member of any groups yet.</p>
      ) : (
        <div>
          {groups.map((groupMember) => (
            <div key={groupMember._id}>
              <h4>{groupMember.groupId.name}</h4>

              <p>
                Currency: {groupMember.groupId.currency}
              </p>

              <p>
                Role: {groupMember.role}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;