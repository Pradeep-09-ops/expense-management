import { BrowserRouter, Routes, Route} from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashBoard from "./pages/DashBoard";
import GroupDetails from "./pages/GroupDetails";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
         <Route path="/dashboard" element={
            <ProtectedRoute>
            <DashBoard />
            </ProtectedRoute>
          }
        />
          <Route path="/groups/:groupsId" element={<GroupDetails/>}/>
        </Routes>
      </BrowserRouter>
  );
}

export default App;