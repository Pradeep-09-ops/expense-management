import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/groupDetails.css";

function GroupDetails() {
  const { groupsId } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Add Member
  const [userId, setUserId] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");

  // Expense
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState("EQUAL");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitValues, setSplitValues] = useState({});

  const [creatingExpense, setCreatingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState("");
  const [expenseSuccess, setExpenseSuccess] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const getConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ---------------- FETCH MEMBERS ----------------

  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/groups/${groupsId}/members`,
        getConfig()
      );

      setMembers(response.data.data);
    } catch (error) {
      console.error(error);

      setMemberError(
        error.response?.data?.message || "Failed to fetch members"
      );
    }
  };

  // ---------------- FETCH EXPENSES ----------------

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/groups/${groupsId}/expenses`,
        getConfig()
      );

      setExpenses(response.data.data);
    } catch (error) {
      console.error(error);

      setExpenseError(
        error.response?.data?.message || "Failed to fetch expenses"
      );
    }
  };

  // ---------------- INITIAL FETCH ----------------

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const groupResponse = await axios.get(
          `http://localhost:3000/api/v1/groups/${groupsId}`,
          getConfig()
        );

        setGroup(groupResponse.data.data);

        await fetchMembers();
        await fetchExpenses();
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

  // ---------------- ADD MEMBER ----------------

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

      await axios.post(
        `http://localhost:3000/api/v1/groups/${groupsId}/members`,
        {
          userId: userId.trim(),
        },
        getConfig()
      );

      setMemberSuccess("Member added successfully");
      setUserId("");

      await fetchMembers();
    } catch (error) {
      console.error(error);

      setMemberError(
        error.response?.data?.message ||
          "Failed to add member"
      );
    } finally {
      setAddingMember(false);
    }
  };

  // ---------------- MEMBER SELECTION ----------------

  const handleMemberSelection = (memberId) => {
    setSelectedMembers((previous) => {
      if (previous.includes(memberId)) {
        // Remove value when member is unchecked
        setSplitValues((values) => {
          const updated = { ...values };
          delete updated[memberId];
          return updated;
        });

        return previous.filter((id) => id !== memberId);
      }

      return [...previous, memberId];
    });
  };

  // ---------------- SPLIT VALUE ----------------

  const handleSplitValueChange = (memberId, value) => {
    setSplitValues((previous) => ({
      ...previous,
      [memberId]: value,
    }));
  };

  // ---------------- SPLIT TYPE CHANGE ----------------

  const handleSplitTypeChange = (e) => {
    setSplitType(e.target.value);

    // Clear old values when changing split type
    setSplitValues({});
  };

  // ---------------- CREATE EXPENSE ----------------

  const handleCreateExpense = async (e) => {
    e.preventDefault();

    setExpenseError("");
    setExpenseSuccess("");

    // Basic validation
    if (!amount || Number(amount) <= 0) {
      setExpenseError("Amount must be greater than 0");
      return;
    }

    if (!description.trim()) {
      setExpenseError("Description is required");
      return;
    }

    if (!paidBy) {
      setExpenseError("Please select who paid");
      return;
    }

    if (selectedMembers.length === 0) {
      setExpenseError(
        "Select at least one member for the split"
      );
      return;
    }

    // ---------------- EQUAL ----------------

    if (splitType === "EQUAL") {
      // No values required.
    }

    // ---------------- EXACT ----------------

    if (splitType === "EXACT") {
      const values = selectedMembers.map(
        (memberId) => Number(splitValues[memberId])
      );

      if (values.some((value) => !value || value < 0)) {
        setExpenseError(
          "Enter a valid amount for every selected member"
        );
        return;
      }

      const total = values.reduce(
        (sum, value) => sum + value,
        0
      );

      if (Math.abs(total - Number(amount)) > 0.001) {
        setExpenseError(
          `Exact split must total ${amount}`
        );
        return;
      }
    }

    // ---------------- PERCENTAGE ----------------

    if (splitType === "PERCENTAGE") {
      const values = selectedMembers.map(
        (memberId) => Number(splitValues[memberId])
      );

      if (values.some((value) => isNaN(value) || value < 0)) {
        setExpenseError(
          "Enter a valid percentage for every selected member"
        );
        return;
      }

      const totalPercentage = values.reduce(
        (sum, value) => sum + value,
        0
      );

      if (Math.abs(totalPercentage - 100) > 0.001) {
        setExpenseError(
          "Percentage split must total 100%"
        );
        return;
      }
    }

    try {
      setCreatingExpense(true);

      // Build splits
      const splits = selectedMembers.map((memberId) => ({
        user: memberId,
        value:
          splitType === "EQUAL"
            ? 0
            : Number(splitValues[memberId]),
      }));

      await axios.post(
        `http://localhost:3000/api/v1/groups/${groupsId}/expenses`,
        {
          amount: Number(amount),
          description: description.trim(),
          paidBy,
          splitType,
          splits,
        },
        getConfig()
      );

      setExpenseSuccess(
        "Expense created successfully"
      );

      // Clear form
      setAmount("");
      setDescription("");
      setPaidBy("");
      setSplitType("EQUAL");
      setSelectedMembers([]);
      setSplitValues({});

      // Refresh expenses
      await fetchExpenses();
    } catch (error) {
      console.error(error);

      setExpenseError(
        error.response?.data?.message ||
          "Failed to create expense"
      );
    } finally {
      setCreatingExpense(false);
    }
  };

  // ---------------- LOADING ----------------

  if (loading) {
    return <h2>Loading group...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  // ---------------- UI ----------------

  return (
  <div className="group-details-page">
    <div className="group-details-container">

      {/* ==============================
          GROUP HEADER
      ============================== */}

      <section className="group-details-header">
        <div className="group-details-header-left">

          <div className="group-details-icon">
            {group.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1>{group.name}</h1>

            <p className="group-details-currency">
              Currency: <strong>{group.currency}</strong>
            </p>
          </div>

        </div>

        <button
          className="group-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </section>


      {/* ==============================
          MEMBERS
      ============================== */}

      <section className="details-card">

        <div className="details-card-header">
          <div className="details-card-title">
            <h2>Members</h2>

            <p>
              People included in this group.
            </p>
          </div>

          <span className="details-count">
            {members.length} Members
          </span>
        </div>

        {members.length === 0 ? (
          <div className="members-empty">
            No members found.
          </div>
        ) : (
          <div className="members-list">

            {members.map((member) => (
              <div
                className="member-item"
                key={member._id}
              >

                <div className="member-avatar">
                  {member.userId.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="member-info">

                  <p className="member-name">
                    {member.userId.name}
                  </p>

                  <p className="member-email">
                    {member.userId.email}
                  </p>

                </div>

                <span
                  className={`member-role ${
                    member.role === "ADMIN"
                      ? "admin"
                      : ""
                  }`}
                >
                  {member.role}
                </span>

              </div>
            ))}

          </div>
        )}

      </section>


      {/* ==============================
          ADD MEMBER
      ============================== */}

      <section className="details-card">

        <div className="details-card-header">
          <div className="details-card-title">
            <h2>Add Member</h2>

            <p>
              Add another user to this group.
            </p>
          </div>
        </div>

        <form
          className="add-member-form"
          onSubmit={handleAddMember}
        >

          <div className="add-member-field">
            <label htmlFor="userId">
              User ID
            </label>

            <input
              id="userId"
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) =>
                setUserId(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="add-member-button"
            disabled={addingMember}
          >
            {addingMember
              ? "Adding..."
              : "Add Member"}
          </button>

        </form>

        {memberSuccess && (
          <p className="group-success">
            {memberSuccess}
          </p>
        )}

        {memberError && (
          <p className="group-error">
            {memberError}
          </p>
        )}

      </section>


      {/* ==============================
          ADD EXPENSE
      ============================== */}

      <section className="details-card">

        <div className="details-card-header">
          <div className="details-card-title">
            <h2>Add Expense</h2>

            <p>
              Record and split a shared expense.
            </p>
          </div>
        </div>

        <form
          className="expense-form"
          onSubmit={handleCreateExpense}
        >

          {/* Amount */}

          <div className="expense-field">
            <label htmlFor="amount">
              Amount
            </label>

            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
            />
          </div>


          {/* Description */}

          <div className="expense-field">
            <label htmlFor="description">
              Description
            </label>

            <input
              id="description"
              type="text"
              placeholder="e.g. Hotel"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </div>


          {/* Paid By */}

          <div className="expense-field">
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

          <div className="expense-field">
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


          {/* Split Between */}

          <div className="split-section">

            <p className="split-section-title">
              Split Between
            </p>

            <div className="split-member-list">

              {members.map((member) => {

                const memberId =
                  member.userId._id;

                const isSelected =
                  selectedMembers.includes(memberId);

                return (
                  <div
                    className="split-member"
                    key={memberId}
                  >

                    <input
                      id={`member-${memberId}`}
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        handleMemberSelection(memberId)
                      }
                    />

                    <label
                      htmlFor={`member-${memberId}`}
                    >
                      {member.userId.name}
                    </label>

                    {isSelected &&
                      splitType !== "EQUAL" && (
                        <input
                          className="split-value-input"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={
                            splitType === "EXACT"
                              ? "Amount"
                              : "Percentage"
                          }
                          value={
                            splitValues[memberId] ?? ""
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


          {/* Create Expense */}

          <div className="expense-submit">

            <button
              type="submit"
              className="create-expense-button"
              disabled={creatingExpense}
            >
              {creatingExpense
                ? "Creating..."
                : "Create Expense"}
            </button>

          </div>

        </form>

        {expenseSuccess && (
          <p className="group-success">
            {expenseSuccess}
          </p>
        )}

        {expenseError && (
          <p className="group-error">
            {expenseError}
          </p>
        )}

      </section>


      {/* ==============================
          EXPENSES
      ============================== */}

      <section className="details-card">

        <div className="details-card-header">
          <div className="details-card-title">
            <h2>Expenses</h2>

            <p>
              All expenses recorded in this group.
            </p>
          </div>

          <span className="details-count">
            {expenses.length} Expenses
          </span>
        </div>

        {expenses.length === 0 ? (
          <div className="expenses-empty">
            No expenses found.
          </div>
        ) : (
          <div className="expense-list">

            {expenses.map((expense) => (
              <div
                className="expense-item"
                key={expense._id}
                onClick={() =>
                  navigate(
                    `/expenses/${expense._id}`
                  )
                }
              >

                <div className="expense-info">

                  <h3>
                    {expense.description}
                  </h3>

                  <p className="expense-paid-by">
                    Paid by {expense.paidBy?.name}
                  </p>

                </div>

                <div>
                  <span className="expense-amount">
                    {group.currency} {expense.amount}
                  </span>

                  <span className="expense-arrow">
                    →
                  </span>
                </div>

              </div>
            ))}

          </div>
        )}

      </section>


      {/* ==============================
          GROUP ACTIONS
      ============================== */}

      <div className="group-actions">

        <button
          className="group-action-button"
          onClick={() =>
            navigate(
              `/groups/${groupsId}/summary`
            )
          }
        >
          View Summary
        </button>

        <button
          className="group-action-button"
          onClick={() =>
            navigate(
              `/groups/${groupsId}/settlement`
            )
          }
        >
          View Settlement
        </button>

      </div>

    </div>
  </div>
);
}

export default GroupDetails;