import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./app/index.tsx";
import { AppBackground } from "./components/app-background.tsx";

function App() {
  return (
    <>
      <AppBackground />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
