import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RollPage from "@/pages/RollPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RollPage />} />
      </Routes>
    </Router>
  );
}
