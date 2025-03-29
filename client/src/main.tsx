import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// React 19では標準的なcreateRootの使用方法
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
