import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/expenseDetails.css"
function ExpenseDetails() {
  const { expenseId } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [members, setMembers] = useState([]);

  const [editing, setEditing] = useState(false);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState("EQUAL");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitValues, setSplitValues] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  //delete state
  const [deleting, setDeleting] = useState(false);

  const getConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ---------------- FETCH EXPENSE ----------------

  const fetchExpense = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/expenses/${expenseId}`,
        getConfig()
      );

      const data = response.data.data;

      setExpense(data);

      // Fill edit form
      setAmount(data.amount);
      setDescription(data.description);
      setPaidBy(data.paidBy?._id);
      setSplitType(data.splitType);

      const memberIds = data.splits.map(
        (split) => split.user._id
      );

      setSelectedMembers(memberIds);

      const values = {};

      data.splits.forEach((split) => {
        values[split.user._id] = split.value;
      });

      setSplitValues(values);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch expense"
      );
    }
  };

  // ---------------- FETCH GROUP MEMBERS ----------------

  const fetchMembers = async (groupId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/groups/${groupId}/members`,
        getConfig()
      );

      setMembers(response.data.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch group members"
      );
    }
  };

  // ---------------- INITIAL LOAD ----------------

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `http://localhost:3000/api/v1/expenses/${expenseId}`,
          getConfig()
        );

        const data = response.data.data;

        setExpense(data);

        setAmount(data.amount);
        setDescription(data.description);
        setPaidBy(data.paidBy?._id);
        setSplitType(data.splitType);

        const memberIds = data.splits.map(
          (split) => split.user._id
        );

        setSelectedMembers(memberIds);

        const values = {};

        data.splits.forEach((split) => {
          values[split.user._id] = split.value;
        });

        setSplitValues(values);

        await fetchMembers(data.groupId);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load expense"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [expenseId]);

  // ---------------- MEMBER SELECTION ----------------

  const handleMemberSelection = (memberId) => {
    setSelectedMembers((previous) => {
      if (previous.includes(memberId)) {
        setSplitValues((values) => {
          const updated = { ...values };
          delete updated[memberId];
          return updated;
        });

        return previous.filter(
          (id) => id !== memberId
        );
      }

      return [...previous, memberId];
    });
  };

  // ---------------- SPLIT VALUE ----------------

  const handleSplitValueChange = (
    memberId,
    value
  ) => {
    setSplitValues((previous) => ({
      ...previous,
      [memberId]: value,
    }));
  };

  // ---------------- SPLIT TYPE ----------------

  const handleSplitTypeChange = (e) => {
    setSplitType(e.target.value);
    setSplitValues({});
  };

  // ---------------- UPDATE EXPENSE ----------------

  const handleUpdateExpense = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (!paidBy) {
      setError("Please select who paid");
      return;
    }

    if (selectedMembers.length === 0) {
      setError(
        "Select at least one member for the split"
      );
      return;
    }

    // EXACT validation
    if (splitType === "EXACT") {
      const values = selectedMembers.map(
        (memberId) =>
          Number(splitValues[memberId])
      );

      if (
        values.some(
          (value) => isNaN(value) || value < 0
        )
      ) {
        setError(
          "Enter a valid amount for every member"
        );
        return;
      }

      const total = values.reduce(
        (sum, value) => sum + value,
        0
      );

      if (
        Math.abs(total - Number(amount)) > 0.001
      ) {
        setError(
          `Exact split must total ${amount}`
        );
        return;
      }
    }

    // PERCENTAGE validation
    if (splitType === "PERCENTAGE") {
      const values = selectedMembers.map(
        (memberId) =>
          Number(splitValues[memberId])
      );

      if (
        values.some(
          (value) => isNaN(value) || value < 0
        )
      ) {
        setError(
          "Enter a valid percentage for every member"
        );
        return;
      }

      const total = values.reduce(
        (sum, value) => sum + value,
        0
      );

      if (Math.abs(total - 100) > 0.001) {
        setError(
          "Percentage split must total 100%"
        );
        return;
      }
    }

    try {
      setSaving(true);

      const splits = selectedMembers.map(
        (memberId) => ({
          user: memberId,
          value:
            splitType === "EQUAL"
              ? 0
              : Number(splitValues[memberId]),
        })
      );

      const response = await axios.patch(
        `http://localhost:3000/api/v1/expenses/${expenseId}`,
        {
          amount: Number(amount),
          description: description.trim(),
          paidBy,
          splitType,
          splits,
        },
        getConfig()
      );

      setExpense(response.data.data);

      setSuccess(
        "Expense updated successfully"
      );

      setEditing(false);

      // Refresh expense
      await fetchExpense();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update expense"
      );
    } finally {
      setSaving(false);
    }
  };


  // ---------------- DELETE     EXPENSE ----------------
  const handleDeleteExpense = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this expense?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeleting(true);
    setError("");
    setSuccess("");

    await axios.delete(
      `http://localhost:3000/api/v1/expenses/${expenseId}`,
      getConfig()
    );

    // Go back to the group page
    navigate(-1);
  } catch (error) {
    console.error(error);

    setError(
      error.response?.data?.message ||
        "Failed to delete expense"
    );
  } finally {
    setDeleting(false);
  }
};

  if (loading) {
    return <h2>Loading expense...</h2>;
  }

  if (error && !expense) {
    return <h2>{error}</h2>;
  }

  if (!expense) {
    return <h2>Expense not found</h2>;
  }

return (
  <div className="expense-details-page">
    <div className="expense-details-container">

      {/* ==============================
          HEADER
      ============================== */}

      <div className="expense-details-header">

        <button
          className="expense-back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div>
          <p className="expense-details-label">
            EXPENSE MANAGEMENT
          </p>

          <h1>Expense Details</h1>
        </div>

      </div>


      {/* ==============================
          MESSAGES
      ============================== */}

      {success && (
        <div className="expense-success">
          {success}
        </div>
      )}

      {error && (
        <div className="expense-error">
          {error}
        </div>
      )}


      {!editing ? (
        <>
          {/* ==============================
              EXPENSE SUMMARY
          ============================== */}

          <section className="expense-summary-card">

            <div className="expense-summary-top">

              <div className="expense-summary-icon">
                ₹
              </div>

              <div className="expense-summary-title">
                <h2>{expense.description}</h2>

                <p>
                  {new Date(
                    expense.date
                  ).toLocaleString()}
                </p>
              </div>

              <div className="expense-amount">
                ₹{expense.amount}
              </div>

            </div>


            <div className="expense-info-grid">

              <div className="expense-info-item">
                <span>Paid By</span>

                <strong>
                  {expense.paidBy?.name}
                </strong>
              </div>

              <div className="expense-info-item">
                <span>Email</span>

                <strong>
                  {expense.paidBy?.email}
                </strong>
              </div>

              <div className="expense-info-item">
                <span>Split Type</span>

                <strong>
                  {expense.splitType}
                </strong>
              </div>

              <div className="expense-info-item">
                <span>Date</span>

                <strong>
                  {new Date(
                    expense.date
                  ).toLocaleDateString()}
                </strong>
              </div>

            </div>

          </section>


          {/* ==============================
              SPLIT DETAILS
          ============================== */}

          <section className="expense-card">

            <div className="expense-card-header">
              <div>
                <h2>Split Details</h2>

                <p>
                  How this expense is divided.
                </p>
              </div>

              <span className="expense-count">
                {expense.splits.length} Members
              </span>
            </div>

            <div className="expense-split-list">

              {expense.splits.map((split) => (
                <div
                  className="expense-split-item"
                  key={split.user._id}
                >

                  <div className="expense-member-avatar">
                    {split.user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="expense-member-info">
                    <strong>
                      {split.user.name}
                    </strong>

                    <span>
                      {split.user.email}
                    </span>
                  </div>

                  <div className="expense-split-value">
                    {expense.splitType ===
                    "PERCENTAGE"
                      ? `${split.value}%`
                      : `₹${split.value}`}
                  </div>

                </div>
              ))}

            </div>

          </section>


          {/* ==============================
              ACTIONS
          ============================== */}

          <div className="expense-actions">

            <button
              className="expense-edit-button"
              onClick={() => {
                setError("");
                setSuccess("");
                setEditing(true);
              }}
            >
              Edit Expense
            </button>

            <button
              className="expense-delete-button"
              onClick={handleDeleteExpense}
              disabled={deleting}
            >
              {deleting
                ? "Deleting..."
                : "Delete Expense"}
            </button>

          </div>

        </>
      ) : (
        <>
          {/* ==============================
              EDIT EXPENSE
          ============================== */}

          <section className="expense-card edit-expense-card">

            <div className="expense-card-header">
              <div>
                <h2>Edit Expense</h2>

                <p>
                  Update the expense details and split.
                </p>
              </div>
            </div>


            <form
              className="edit-expense-form"
              onSubmit={handleUpdateExpense}
            >

              {/* Amount */}

              <div className="edit-field">
                <label htmlFor="amount">
                  Amount
                </label>

                <input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                />
              </div>


              {/* Description */}

              <div className="edit-field">
                <label htmlFor="description">
                  Description
                </label>

                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />
              </div>


              {/* Paid By */}

              <div className="edit-field">
                <label htmlFor="paidBy">
                  Paid By
                </label>

                <select
                  id="paidBy"
                  value={paidBy}
                  onChange={(e) =>
                    setPaidBy(e.target.value)
                  }
                >
                  <option value="">
                    Select member
                  </option>

                  {members.map((member) => (
                    <option
                      key={member.userId._id}
                      value={member.userId._id}
                    >
                      {member.userId.name}
                    </option>
                  ))}
                </select>
              </div>


              {/* Split Type */}

              <div className="edit-field">
                <label htmlFor="splitType">
                  Split Type
                </label>

                <select
                  id="splitType"
                  value={splitType}
                  onChange={handleSplitTypeChange}
                >
                  <option value="EQUAL">
                    Equal
                  </option>

                  <option value="EXACT">
                    Exact Amount
                  </option>

                  <option value="PERCENTAGE">
                    Percentage
                  </option>
                </select>
              </div>


              {/* Split Members */}

              <div className="edit-split-section">

                <div className="edit-split-header">
                  <div>
                    <h3>Split Between</h3>

                    <p>
                      Select the members included
                      in this expense.
                    </p>
                  </div>
                </div>

                <div className="edit-member-list">

                  {members.map((member) => {

                    const memberId =
                      member.userId._id;

                    const isSelected =
                      selectedMembers.includes(
                        memberId
                      );

                    return (
                      <div
                        className="edit-member-item"
                        key={memberId}
                      >

                        <div className="edit-member-check">

                          <input
                            id={`edit-${memberId}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleMemberSelection(
                                memberId
                              )
                            }
                          />

                          <label
                            htmlFor={`edit-${memberId}`}
                          >
                            {member.userId.name}
                          </label>

                        </div>

                        {isSelected &&
                          splitType !== "EQUAL" && (
                            <input
                              className="edit-split-value"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder={
                                splitType === "EXACT"
                                  ? "Amount"
                                  : "Percentage"
                              }
                              value={
                                splitValues[
                                  memberId
                                ] ?? ""
                              }
                              onChange={(e) =>
                                handleSplitValueChange(
                                  memberId,
                                  e.target.value
                                )
                              }
                            />
                          )}

                      </div>
                    );
                  })}

                </div>

              </div>


              {/* Buttons */}

              <div className="edit-expense-actions">

                <button
                  type="submit"
                  className="save-expense-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="cancel-expense-button"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>

          </section>
        </>
      )}

    </div>
  </div>
);
}

export default ExpenseDetails;