import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// React 19では、ルートDOMノードを指定する方法を改善
// nullの場合のエラーハンドリングを追加
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
