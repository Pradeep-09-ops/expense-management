import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

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
    <div>
      <button onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Expense Details</h1>

      {success && (
        <p style={{ color: "green" }}>
          {success}
        </p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {!editing ? (
        <>
          <h2>{expense.description}</h2>

          <p>
            <strong>Amount:</strong>{" "}
            ₹{expense.amount}
          </p>

          <p>
            <strong>Paid By:</strong>{" "}
            {expense.paidBy?.name}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {expense.paidBy?.email}
          </p>

          <p>
            <strong>Split Type:</strong>{" "}
            {expense.splitType}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {new Date(
              expense.date
            ).toLocaleString()}
          </p>

          <hr />

          <h2>Split Details</h2>

          <ul>
            {expense.splits.map((split) => (
              <li key={split.user._id}>
                <strong>
                  {split.user.name}
                </strong>
                {" — "}
                {expense.splitType ===
                "PERCENTAGE"
                  ? `${split.value}`
                  : `₹${split.value}`}
              </li>
            ))}
          </ul>

          <br />

        <button
            onClick={() => {
                setError("");
                setSuccess("");
                setEditing(true);
            }}
            >
            Edit Expense
        </button>

        {" "}

        <button
            onClick={handleDeleteExpense}
            disabled={deleting}
            >
            {deleting ? "Deleting..." : "Delete Expense"}
        </button>
     </>
      ) : (
        <>
          <h2>Edit Expense</h2>

          <form onSubmit={handleUpdateExpense}>
            <div>
              <label>Amount</label>
              <br />

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />
            </div>

            <br />

            <div>
              <label>Description</label>
              <br />

              <input
                type="text"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />
            </div>

            <br />

            <div>
              <label>Paid By</label>
              <br />

              <select
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

            <br />

            <div>
              <label>Split Type</label>
              <br />

              <select
                value={splitType}
                onChange={
                  handleSplitTypeChange
                }
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

            <div>
              <label>Split Between</label>

              {members.map((member) => {
                const memberId =
                  member.userId._id;

                const isSelected =
                  selectedMembers.includes(
                    memberId
                  );

                return (
                  <div key={memberId}>
                    <label>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          handleMemberSelection(
                            memberId
                          )
                        }
                      />

                      {" "}
                      {member.userId.name}
                    </label>

                    {isSelected &&
                      splitType !== "EQUAL" && (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={
                            splitType ===
                            "EXACT"
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

            <br />

            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            {" "}

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError("");
              }}
            >
              Cancel
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default ExpenseDetails;