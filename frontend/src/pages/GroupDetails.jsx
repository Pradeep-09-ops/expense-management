import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

      {/* MEMBERS */}

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

      {/* ADD MEMBER */}

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

      <hr />

      {/* ADD EXPENSE */}

      <h2>Add Expense</h2>

      <form onSubmit={handleCreateExpense}>
        {/* AMOUNT */}

        <div>
          <label>Amount</label>
          <br />

          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <br />

        {/* DESCRIPTION */}

        <div>
          <label>Description</label>
          <br />

          <input
            type="text"
            placeholder="e.g. Hotel"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />
        </div>

        <br />

        {/* PAID BY */}

        <div>
          <label>Paid By</label>
          <br />

          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
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

        <br />

        {/* SPLIT TYPE */}

        <div>
          <label>Split Type</label>
          <br />

          <select
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

        <br />

        {/* SPLIT BETWEEN */}

        <div>
          <label>Split Between</label>

          {members.map((member) => {
            const memberId = member.userId._id;

            const isSelected =
              selectedMembers.includes(memberId);

            return (
              <div key={memberId}>
                <label>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      handleMemberSelection(memberId)
                    }
                  />

                  {" "}
                  {member.userId.name}
                </label>

                {/* EXACT / PERCENTAGE INPUT */}

                {isSelected &&
                  splitType !== "EQUAL" && (
                    <input
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

        <br />

        <button
          type="submit"
          disabled={creatingExpense}
        >
          {creatingExpense
            ? "Creating..."
            : "Create Expense"}
        </button>
      </form>

      {expenseSuccess && (
        <p style={{ color: "green" }}>
          {expenseSuccess}
        </p>
      )}

      {expenseError && (
        <p style={{ color: "red" }}>
          {expenseError}
        </p>
      )}

      <hr />

      {/* EXPENSES */}
      
      <h2>Expenses</h2>

      {expenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <ul>
          {expenses.map((expense) => (
          <li
            key={expense._id}
            onClick={() =>
              navigate(`/expenses/${expense._id}`)
            }
            style={{ cursor: "pointer" }}
          >
            <strong>
              {expense.description}
            </strong>

            {" — "}

            {group.currency} {expense.amount}

            {" — Paid by: "}

            {expense.paidBy?.name}
          </li>
        ))}
        </ul>
      )}

      <button
      onClick={() =>
        navigate(`/groups/${groupsId}/summary`)
      }
      >
      View Summary
    </button>

  <button
    onClick={() =>
      navigate(`/groups/${groupsId}/settlement`)
    }
  >
  View Settlement
  </button>
    </div>
  );
}

export default GroupDetails;