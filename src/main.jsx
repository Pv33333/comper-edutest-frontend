import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./styles/theme.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Dev: mai fluid (evită dublarea efectelor); Prod: păstrează StrictMode
if (import.meta.env.DEV) {
  root.render(<App />);
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
