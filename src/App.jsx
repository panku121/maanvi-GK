import { HashRouter, Route, Routes } from "react-router-dom";
import Soundscape from "./components/Soundscape.jsx";
import Done from "./pages/Done.jsx";
import Home from "./pages/Home.jsx";
import Quiz from "./pages/Quiz.jsx";

export default function App() {
  return (
    <HashRouter>
      <Soundscape />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:setId" element={<Quiz />} />
        <Route path="/done/:setId" element={<Done />} />
      </Routes>
    </HashRouter>
  );
}
