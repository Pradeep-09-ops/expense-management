import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function GroupDetails() {
  const { groupsId } = useParams();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:3000/api/v1/groups/${groupsId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setGroup(response.data.data);
      } catch (error) {
        console.error(error);
        setError(
          error.response?.data?.message || "Failed to fetch group"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
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
    </div>
  );
}

export default GroupDetails;