import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function GroupDetails() {
  const { groupsId } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        // Fetch members
        const membersResponse = await axios.get(
          `http://localhost:3000/api/v1/groups/${groupsId}/members`,
          config
        );

        setGroup(groupResponse.data.data);
        setMembers(membersResponse.data.data);

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
    </div>
  );
}

export default GroupDetails;