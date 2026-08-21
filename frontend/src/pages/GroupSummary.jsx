import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function GroupSummary() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `http://localhost:3000/api/v1/${groupId}/summary`,
        config
      );

      setSummary(response.data.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch group summary"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [groupId]);

  if (loading) {
    return <h2>Loading summary...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!summary) {
    return <h2>No summary available</h2>;
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Group Summary</h1>

      <hr />

      <h2>Total Expenses</h2>

      <h3>₹{summary.totalExpenses}</h3>

      <hr />

      <h2>Member Balances</h2>

      {summary.members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul>
          {summary.members.map((member) => (
            <li key={member.user._id}>
              <h3>{member.user.name}</h3>

              <p>
                <strong>Email:</strong>{" "}
                {member.user.email}
              </p>

              <p>
                <strong>Paid:</strong>{" "}
                ₹{member.paid}
              </p>

              <p>
                <strong>Owed:</strong>{" "}
                ₹{member.owed}
              </p>

              <p>
                <strong>Balance:</strong>{" "}
                ₹{member.balance}
              </p>

              {member.balance > 0 && (
                <p style={{ color: "green" }}>
                  Should receive ₹{member.balance}
                </p>
              )}

              {member.balance < 0 && (
                <p style={{ color: "red" }}>
                  Owes ₹{Math.abs(member.balance)}
                </p>
              )}

              {member.balance === 0 && (
                <p>Settled</p>
              )}

              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GroupSummary;