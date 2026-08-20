import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function GroupDetails() {
  const { groupsId } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);

  const [userId, setUserId] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `http://localhost:3000/api/v1/groups/${groupsId}/members`,
        config
      );

      setMembers(response.data.data);
    } catch (error) {
      console.error(error);

      setMemberError(
        error.response?.data?.message || "Failed to fetch members"
      );
    }
  };

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch group
        const groupResponse = await axios.get(
          `http://localhost:3000/api/v1/groups/${groupsId}`,
          config
        );

        setGroup(groupResponse.data.data);

        // Fetch members
        await fetchMembers();
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to fetch group details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupsId]);

  const handleAddMember = async (e) => {
    e.preventDefault();

    setMemberError("");
    setMemberSuccess("");

    if (!userId.trim()) {
      setMemberError("Please enter a user ID");
      return;
    }

    try {
      setAddingMember(true);

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        `http://localhost:3000/api/v1/groups/${groupsId}/members`,
        {
          userId: userId.trim(),
        },
        config
      );

      setMemberSuccess("Member added successfully");

      // Clear input
      setUserId("");

      // Fetch updated members
      await fetchMembers();
    } catch (error) {
      console.error(error);

      setMemberError(
        error.response?.data?.message || "Failed to add member"
      );
    } finally {
      setAddingMember(false);
    }
  };

  if (loading) {
    return <h2>Loading group...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>{group.name}</h1>

      <p>
        <strong>Group ID:</strong> {group._id}
      </p>

      <p>
        <strong>Currency:</strong> {group.currency}
      </p>

      <p>
        <strong>Owner ID:</strong> {group.ownerId}
      </p>

      <hr />

      <h2>Members</h2>

      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li key={member._id}>
              <strong>{member.userId.name}</strong>
              {" — "}
              {member.userId.email}
              {" — "}
              {member.role}
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h2>Add Member</h2>

      <form onSubmit={handleAddMember}>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <button type="submit" disabled={addingMember}>
          {addingMember ? "Adding..." : "Add Member"}
        </button>
      </form>

      {memberSuccess && (
        <p style={{ color: "green" }}>
          {memberSuccess}
        </p>
      )}

      {memberError && (
        <p style={{ color: "red" }}>
          {memberError}
        </p>
      )}
    </div>
  );
}

export default GroupDetails;