import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashBoard from "./pages/DashBoard";
import GroupDetails from "./pages/GroupDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ExpenseDetails from "./pages/ExpenseDetails";
import GroupSummary from "./pages/GroupSummary";

function App() {
  return (
    <BrowserRouter>
    <Navbar/>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups/:groupsId"
          element={
            <ProtectedRoute>
              <GroupDetails />
            </ProtectedRoute>
          }
        />

      <Route
          path="/expenses/:expenseId"
          element={
            <ProtectedRoute>
              <ExpenseDetails />
            </ProtectedRoute>
          }
        />
       <Route
          path="/groups/:groupId/summary"
          element={<GroupSummary />}
      />
      </Routes>

    </BrowserRouter>
  );
}

export default App;