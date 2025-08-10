import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppBackground } from "./components/app-background.tsx";
import { Header } from "./components/header.tsx";
import { Home } from "./app/index.tsx";

function App() {
  return (
    <>
      <AppBackground />
      <Header />
      <main className="flex-1">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </main>
    </>
  );
}

export default App;
