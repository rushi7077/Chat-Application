import React, { useState } from "react";
import { createRoomApi, joinChatApi } from "../service/RoomService";
import { toast } from "react-hot-toast";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import { MdGroups, MdPersonAdd, MdCreate, MdChat } from "react-icons/md";
import { motion } from "framer-motion";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    userName: "",
    roomId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Please fill all fields!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const room = await joinChatApi(detail.roomId);
      toast.success(`Welcome to room ${room.roomId}!`, {
        icon: "👋",
        style: {
          borderRadius: "10px",
          background: "#4f46e5",
          color: "#fff",
        },
      });
      setCurrentUser(detail.userName);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      toast.error(error.response?.data || "Error joining room", {
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function createChat() {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const response = await createRoomApi(detail.roomId);
      toast.success(`Room ${response.roomId} created!`, {
        icon: "🎉",
        style: {
          borderRadius: "10px",
          background: "#4f46e5",
          color: "#fff",
        },
      });
      setRoomId(response.roomId);
      setCurrentUser(detail.userName);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      toast.error(error.response?.data || "Error creating room", {
        style: {
          borderRadius: "10px",
          background: "#ef4444",
          color: "#fff",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-center space-x-3">
          <MdChat className="text-indigo-600 text-3xl" />
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-indigo-600">We</span>Chat
          </h1>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center p-4"
      >
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="flex justify-center mb-4"
            >
              <MdGroups className="text-white text-5xl" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white">
              Join or Create a Chat
            </h1>
            <p className="text-indigo-100 mt-3 text-lg">
              Connect with friends in real-time
            </p>
          </div>

          {/* Form */}
          <div className="p-8 space-y-6">
            {/* Name Input */}
            <motion.div variants={itemVariants} className="space-y-3">
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-700"
              >
                Your Name
              </label>
              <div className="relative">
                <input
                  onChange={handleFormInputChange}
                  value={detail.userName}
                  name="userName"
                  type="text"
                  id="userName"
                  placeholder="Enter your name"
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all duration-200 placeholder-gray-400"
                />
                <MdPersonAdd className="absolute right-4 top-3.5 text-gray-400 text-xl" />
              </div>
            </motion.div>

            {/* Room ID Input */}
            <motion.div variants={itemVariants} className="space-y-3">
              <label
                htmlFor="roomId"
                className="block text-sm font-medium text-gray-700"
              >
                Room ID
              </label>
              <div className="relative">
                <input
                  onChange={handleFormInputChange}
                  value={detail.roomId}
                  name="roomId"
                  type="text"
                  id="roomId"
                  placeholder="Enter room ID"
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all duration-200 placeholder-gray-400"
                />
                <MdCreate className="absolute right-4 top-3.5 text-gray-400 text-xl" />
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col space-y-4 pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={joinChat}
                disabled={isSubmitting}
                className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-xl transition-all duration-200 ${
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white shadow-md`}
              >
                <MdPersonAdd className="text-xl" />
                <span className="font-medium">
                  {isSubmitting ? "Joining..." : "Join Existing Room"}
                </span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createChat}
                disabled={isSubmitting}
                className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-xl transition-all duration-200 ${
                  isSubmitting
                    ? "border-indigo-300 text-indigo-300 cursor-not-allowed"
                    : "border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                } border-2 bg-white shadow-md`}
              >
                <MdCreate className="text-xl" />
                <span className="font-medium">
                  {isSubmitting ? "Creating..." : "Create New Room"}
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default JoinCreateChat;