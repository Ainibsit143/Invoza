import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Invoza</h1>
      <p>Simple invoicing for freelancers & small businesses.</p>
      <Link to="/login">Login</Link>
    </div>
  );
}

function Login() {
  return (
    <div>
      <h1>Login</h1>
      <Link to="/">Back to Home</Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;