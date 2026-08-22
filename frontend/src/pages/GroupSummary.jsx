import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/groupSummary.css"
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
  <div className="summary-page">
    <div className="summary-container">

      {/* ==============================
          HEADER
      ============================== */}

      <section className="summary-header">

        <button
          className="summary-back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <p className="summary-label">
          EXPENSE MANAGEMENT
        </p>

        <h1>Group Summary</h1>

        <p className="summary-subtitle">
          Overview of expenses and member balances.
        </p>

      </section>


      {/* ==============================
          TOTAL EXPENSES
      ============================== */}

      <section className="total-expense-card">

        <div className="total-expense-icon">
          ₹
        </div>

        <div>
          <p>Total Expenses</p>

          <h2>
            ₹{summary.totalExpenses}
          </h2>
        </div>

      </section>


      {/* ==============================
          MEMBER BALANCES
      ============================== */}

      <section className="summary-card">

        <div className="summary-card-header">

          <div>
            <h2>Member Balances</h2>

            <p>
              See who has paid, owes, or should receive money.
            </p>
          </div>

          <span className="summary-count">
            {summary.members.length} Members
          </span>

        </div>


        {summary.members.length === 0 ? (
          <div className="summary-empty">
            No members found.
          </div>
        ) : (
          <div className="balance-grid">

            {summary.members.map((member) => (

              <div
                className="balance-card"
                key={member.user._id}
              >

                {/* Member Header */}

                <div className="balance-card-header">

                  <div className="balance-avatar">
                    {member.user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="balance-member-info">

                    <h3>
                      {member.user.name}
                    </h3>

                    <p>
                      {member.user.email}
                    </p>

                  </div>

                </div>


                {/* Financial Details */}

                <div className="balance-details">

                  <div className="balance-item">
                    <span>Paid</span>

                    <strong>
                      ₹{member.paid}
                    </strong>
                  </div>

                  <div className="balance-item">
                    <span>Owed</span>

                    <strong>
                      ₹{member.owed}
                    </strong>
                  </div>

                  <div className="balance-item balance-total">
                    <span>Balance</span>

                    <strong>
                      ₹{member.balance}
                    </strong>
                  </div>

                </div>


                {/* Balance Status */}

                {member.balance > 0 && (
                  <div className="balance-status receive">
                    ↑ Should receive ₹{member.balance}
                  </div>
                )}

                {member.balance < 0 && (
                  <div className="balance-status owe">
                    ↓ Owes ₹{Math.abs(member.balance)}
                  </div>
                )}

                {member.balance === 0 && (
                  <div className="balance-status settled">
                    ✓ Settled
                  </div>
                )}

              </div>

            ))}

          </div>
        )}

      </section>

    </div>
  </div>
);
}

export default GroupSummary;