import { useState } from "react";
import api from "../services/api";

function CreateGroup({ onGroupCreated }) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/groups", {
        name,
        currency,
      });

      console.log("Group created:", response.data);

      setName("");
      setCurrency("INR");

      onGroupCreated();
    } catch (error) {
      console.error("Failed to create group:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create group. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Create Group</h3>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Group Name</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Goa Trip"
            required
          />
        </div>

        <div>
          <label>Currency</label>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
}

export default CreateGroup;