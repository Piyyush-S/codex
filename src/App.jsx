import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/login";
import Signup from "./pages/signup";

import Dashboard from "./pages/Dashboard";
import Room from "./pages/Room";
import Match from "./pages/Match";
import Result from "./pages/Result";

import Problem from "./pages/Problem";
import ProblemSolve from "./pages/ProblemSolve";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* MAIN */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/problem"
          element={<Problem />}
        />
        <Route
          path="/problem/:id"
          element={<ProblemSolve />}
        />
        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />


        {/* GAME */}

        <Route
          path="/room/:roomId"
          element={<Room />}
        />

        <Route
          path="/match/:roomId"
          element={<Match />}
        />

        <Route
          path="/result/:roomId"
          element={<Result />}
        />


        {/* FALLBACK */}

        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f5f3"
              }}
            >
              <div
                style={{
                  textAlign: "center"
                }}
              >
                <h1
                  style={{
                    fontSize: "70px",
                    marginBottom: "10px"
                  }}
                >
                  404
                </h1>

                <p>
                  Page not found
                </p>
              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;