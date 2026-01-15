import { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend, MdExitToApp, MdAccountCircle, MdMoreVert } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../service/RoomService";
import { timeAgo } from "../config/helper";
import { motion, AnimatePresence } from "framer-motion";

// Background generator with gradient options
const generateBackground = () => {
  const hue = Math.floor(Math.random() * 360);
  const options = [
    `linear-gradient(135deg, hsl(${hue}, 80%, 96%) 0%, hsl(${hue}, 60%, 92%) 100%)`,
    `linear-gradient(to bottom right, hsl(${hue}, 70%, 95%), hsl(${hue + 30}, 60%, 90%)`,
    `radial-gradient(circle at center, hsl(${hue}, 70%, 96%), hsl(${hue + 60}, 60%, 92%))`
  ];
  return {
    background: options[Math.floor(Math.random() * options.length)],
    type: "gradient"
  };
};

// Consistent user color mapping
const getColorFromName = (name) => {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-teal-500',
    'bg-amber-500', 'bg-rose-500', 'bg-emerald-500',
    'bg-indigo-500', 'bg-fuchsia-500'
  ];
  const charCode = name?.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const [bgStyle, setBgStyle] = useState(generateBackground());
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);

  // Check connection status
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, navigate]);

  // Initialize background and floating elements
  useEffect(() => {
    setBgStyle(generateBackground());
    
    const elements = Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 20,
      opacity: Math.random() * 0.1 + 0.05,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    setFloatingElements(elements);
  }, [roomId]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await getMessagess(roomId);
        setMessages(fetchedMessages);
      } catch (error) {
        toast.error("Failed to load messages.");
        console.error("Error loading messages:", error);
      }
    };
    
    if (connected && roomId) loadMessages();
  }, [connected, roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    let client = null;

    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected to chat", {
          icon: '🔗',
          style: {
            borderRadius: '10px',
            background: '#4f46e5',
            color: '#fff',
          },
        });

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        },
        (error) => {
          toast.error("Subscription error: " + error.message);
          console.error("STOMP subscription error:", error);
        });
      },
      (error) => {
        toast.error("WebSocket connection failed: " + error.message);
        console.error("STOMP connection error:", error);
        setConnected(false);
      });
    };

    if (connected && roomId) connectWebSocket();

    return () => {
      if (client) client.disconnect(() => console.log("Disconnected from WebSocket"));
    };
  }, [roomId, connected, setConnected]);

  const sendMessage = () => {
    if (stompClient && connected && input.trim()) {
      try {
        stompClient.send(
          `/app/sendMessage/${roomId}`,
          {},
          JSON.stringify({
            sender: currentUser,
            content: input,
            roomId: roomId,
            timeStamp: Date.now(),
          })
        );
        setInput("");
      } catch (error) {
        toast.error("Failed to send message.");
        console.error("Error sending message:", error);
      }
    }
  };

  const handleLogout = () => {
    if (stompClient) {
      stompClient.disconnect(() => toast.success("Disconnected from chat."));
    }
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col font-sans antialiased relative overflow-hidden">
      {/* Background layer */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000"
        style={bgStyle}
      >
        {/* Animated floating elements */}
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            initial={{ x: `${element.x}%`, y: `${element.y}%`, opacity: 0 }}
            animate={{
              y: [`${element.y}%`, `${element.y + 10}%`, `${element.y}%`],
              opacity: [0, element.opacity, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute rounded-full bg-indigo-100/50"
            style={{
              width: `${element.size}px`,
              height: `${element.size}px`,
              filter: 'blur(20px)'
            }}
          />
        ))}
      </div>

      {/* Content container */}
      <div className="absolute inset-0 z-10 flex flex-col bg-white/10 backdrop-blur-[1px]">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm py-4 px-6 flex justify-between items-center shadow-sm border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse absolute -right-1 -top-1 border-2 border-white"></div>
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                {roomId?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Room: {roomId}</h1>
              <p className="text-xs text-gray-500">{messages.length} messages</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full ${getColorFromName(currentUser)} flex items-center justify-center text-white font-medium`}>
                  {currentUser?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-700 hidden md:inline">{currentUser}</span>
                <MdMoreVert className="text-gray-500" />
              </button>
              
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-100 w-48 overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-gray-800">{currentUser}</p>
                      <p className="text-xs text-gray-500">Active now</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                    >
                      <MdExitToApp />
                      <span>Leave Room</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Chat messages */}
        <main
          ref={chatBoxRef}
          className="flex-1 p-4 md:p-6 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                      message.sender === currentUser
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.sender !== currentUser && (
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${getColorFromName(message.sender)}`}>
                          {message.sender?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        {message.sender !== currentUser && (
                          <p className="font-semibold text-sm text-gray-700 mb-1">
                            {message.sender}
                          </p>
                        )}
                        <p className="text-base leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${message.sender === currentUser ? "text-indigo-200" : "text-gray-500"}`}>
                          {timeAgo(message.timeStamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* Message input */}
        <div className="bg-white/90 backdrop-blur-sm border-t border-gray-100 p-4 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              layout
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-inner"
            >
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
              >
                <MdAttachFile size={22} />
              </motion.button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                type="text"
                placeholder="Type your message..."
                className="flex-1 border-none px-3 py-3 focus:outline-none bg-transparent text-gray-700 placeholder-gray-400"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={!input.trim()}
                className={`p-2 rounded-full transition-all ${
                  input.trim()
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <MdSend size={22} />
              </motion.button>
            </motion.div>
            <p className="text-xs text-center text-gray-400 mt-2">
              Press Enter to send
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;