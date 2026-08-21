import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function GroupSettlement() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSettlements = async () => {
    try {
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `http://localhost:3000/api/v1/${groupId}/settlement`,
        config
      );

      setSettlements(response.data.data.settlements);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch settlements"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [groupId]);

  if (loading) {
    return <h2>Loading settlements...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Settlement</h1>

      <hr />

      {settlements.length === 0 ? (
        <div>
          <h2>All Settled 🎉</h2>
          <p>
            There are no outstanding payments in this
            group.
          </p>
        </div>
      ) : (
        <div>
          <h2>Pending Payments</h2>

          {settlements.map((settlement, index) => (
            <div key={index}>
              <p>
                <strong>
                  {settlement.from.name}
                </strong>

                {" should pay "}

                <strong>
                  {settlement.to.name}
                </strong>

                {" ₹"}

                <strong>
                  {Number(
                    settlement.amount
                  ).toFixed(2)}
                </strong>
              </p>

              <p>
                From:{" "}
                {settlement.from.email}
              </p>

              <p>
                To:{" "}
                {settlement.to.email}
              </p>

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GroupSettlement;