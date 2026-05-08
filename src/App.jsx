import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Room from "./pages/Room";
import Match from "./pages/Match";
import Result from "./pages/Result";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/match/:roomId" element={<Match />} />
        <Route path="/result/:roomId" element={<Result />} />

        {/* fallback */}
        <Route
          path="*"
          element={
            <h1 style={{ color: "black", textAlign: "center", marginTop: "50px" }}>
              404 Not Found
            </h1>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;