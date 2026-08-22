import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/groupSettlement.css";

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
    return (
      <div className="settlement-loading">
        Loading settlements...
      </div>
    );
  }

  if (error) {
    return (
      <div className="settlement-page">
        <div className="settlement-container">
          <div className="settlement-error">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settlement-page">
      <div className="settlement-container">

        {/* ==============================
            HEADER
        ============================== */}

        <section className="settlement-header">

          <button
            className="settlement-back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <p className="settlement-label">
            EXPENSE MANAGEMENT
          </p>

          <h1>Settlement</h1>

          <p className="settlement-subtitle">
            See how outstanding expenses should be settled.
          </p>

        </section>


        {/* ==============================
            ALL SETTLED
        ============================== */}

        {settlements.length === 0 ? (
          <section className="settled-card">

            <div className="settled-icon">
              ✓
            </div>

            <h2>All Settled 🎉</h2>

            <p>
              There are no outstanding payments
              in this group.
            </p>

            <button
              className="settled-back-button"
              onClick={() => navigate(-1)}
            >
              Back to Group
            </button>

          </section>
        ) : (

          /* ==============================
             PENDING PAYMENTS
          ============================== */

          <section className="settlement-card">

            <div className="settlement-card-header">

              <div>
                <h2>Pending Payments</h2>

                <p>
                  Outstanding payments between group members.
                </p>
              </div>

              <span className="settlement-count">
                {settlements.length}{" "}
                {settlements.length === 1
                  ? "Payment"
                  : "Payments"}
              </span>

            </div>


            <div className="settlement-list">

              {settlements.map(
                (settlement, index) => (

                  <div
                    className="settlement-item"
                    key={index}
                  >

                    {/* From */}

                    <div className="settlement-person">

                      <div className="settlement-avatar">
                        {settlement.from.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {settlement.from.name}
                        </strong>

                        <span>
                          {settlement.from.email}
                        </span>
                      </div>

                    </div>


                    {/* Payment */}

                    <div className="settlement-payment">

                      <div className="settlement-arrow">
                        →
                      </div>

                      <div>
                        <span>
                          should pay
                        </span>

                        <strong>
                          ₹
                          {Number(
                            settlement.amount
                          ).toFixed(2)}
                        </strong>
                      </div>

                    </div>


                    {/* To */}

                    <div className="settlement-person">

                      <div className="settlement-avatar receiver">
                        {settlement.to.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {settlement.to.name}
                        </strong>

                        <span>
                          {settlement.to.email}
                        </span>
                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>
        )}

      </div>
    </div>
  );
}

export default GroupSettlement;