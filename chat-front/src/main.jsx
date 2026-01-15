import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { Routes, Route } from "react-router";
import JoinCreateChat from "./components/JoinCreateChat.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";
import { Toaster } from "react-hot-toast";


createRoot(document.getElementById("root")).render(
  
    <BrowserRouter>
    
    <Toaster position="top-center" />
      <ChatProvider>
        
        <Routes>
          <Route path="/" element={<JoinCreateChat />} />
          <Route path="/chat" element={<App />} />
        </Routes>
        
      </ChatProvider>
    </BrowserRouter>

);
