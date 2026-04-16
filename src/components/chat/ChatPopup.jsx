import React, { useState, useEffect, useRef } from "react";
import { Send, Plus, X } from "lucide-react";
import io from "socket.io-client";
import { getChatChannels, getChatMessages, sendChatMessage, createChatChannel } from "../../api/chat";
import useAuthStore from "../../store/authstore";
import "./ChatPopup.css";

const ChatPopup = ({ projectId, setIsChatOpen }) => {
  const { user } = useAuthStore();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const messagesEndRef = useRef(null);
  const selectedChannelRef = useRef(null); // Ref to track current channel for socket listener

  // Update ref whenever selectedChannel changes
  useEffect(() => {
    selectedChannelRef.current = selectedChannel;
  }, [selectedChannel]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect", () => {
      console.log("Chat connected:", newSocket.id);
      if (selectedChannel) {
        newSocket.emit("join-channel", selectedChannel.id);
      }
    });

    newSocket.on("message-received", (data) => {
      console.log("Message received for channel:", data.channelId, "Current channel:", selectedChannelRef.current?.id);
      
      // Only add if it's for the current channel and not a duplicate
      if (data.channelId === selectedChannelRef.current?.id) {
        setMessages((prev) => {
          const messageExists = prev.some((m) => m.id === data.id);
          if (!messageExists) {
            const newMessage = {
              id: data.id || Math.random(),
              ...data,
              createdAt: data.createdAt || new Date().toISOString(),
            };
            console.log("Socket: Adding message from other user:", newMessage);
            // Sort messages by createdAt ascending (oldest first)
            return [...prev, newMessage].sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
          }
          return prev;
        });
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Chat disconnected");
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // Fetch channels on component mount
  useEffect(() => {
    if (!projectId) return;

    const fetchChannels = async () => {
      try {
        const response = await getChatChannels(projectId);
        setChannels(response.data);
        if (response.data.length > 0 && !selectedChannel) {
          setSelectedChannel(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch channels:", error);
      }
    };

    fetchChannels();
  }, [projectId]);

  // Join/leave channel rooms when selected channel changes
  useEffect(() => {
    if (!socket || !selectedChannel) return;

    console.log("Joining channel:", selectedChannel.id);
    socket.emit("join-channel", selectedChannel.id);

    return () => {
      console.log("Leaving channel:", selectedChannel.id);
      socket.emit("leave-channel", selectedChannel.id);
    };
  }, [socket, selectedChannel]);

  // Fetch messages when channel changes
  useEffect(() => {
    if (!selectedChannel || !socket) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await getChatMessages(selectedChannel.id);
        console.log("Fetched messages response:", response);
        
        // Extract messages array from response (could be nested or direct)
        let messagesArray = Array.isArray(response.data) ? response.data : response;
        if (messagesArray.data && Array.isArray(messagesArray.data)) {
          messagesArray = messagesArray.data;
        }
        
        // Ensure it's an array and sort by createdAt ascending (oldest first)
        if (Array.isArray(messagesArray)) {
          messagesArray = messagesArray.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          setMessages(messagesArray);
          console.log("Loaded messages for channel:", selectedChannel.id, messagesArray.length, "messages");
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChannel, socket]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel) return;

    const messageContent = messageInput;
    setMessageInput(""); // Clear input immediately

    try {
      console.log("Sending message to channel:", selectedChannel.id);
      const response = await sendChatMessage(selectedChannel.id, {
        content: messageContent,
      });
      
      console.log("Message send response:", response);
      
      // Immediately add sent message to state with optimistic update
      if (response && response.data) {
        const newMessage = {
          id: response.data.id,
          authorId: response.data.authorId || user?.id,
          author: response.data.author || user,
          content: response.data.content,
          createdAt: response.data.createdAt || new Date().toISOString(),
          isEdited: response.data.isEdited || false,
        };
        console.log("Adding new message:", newMessage);
        setMessages((prev) => {
          const updated = [...prev, newMessage].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          console.log("Messages after send:", updated);
          return updated;
        });
      } else {
        console.error("No message data in response:", response);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Re-populate input if send failed
      setMessageInput(messageContent);
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      const response = await createChatChannel({
        name: newChannelName,
        projectId,
        isDirectMessage: false,
      });
      setChannels((prev) => [...prev, response.data]);
      setSelectedChannel(response.data);
      setNewChannelName("");
      setShowNewChannelModal(false);
    } catch (error) {
      console.error("Failed to create channel:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-popup-container">
      <div className="chat-popup">
        {/* Header */}
        <div className="chat-popup-header">
          <h3>💬 Project Chat</h3>
          <button
            onClick={() => setIsChatOpen(false)}
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Channels Tabs */}
        <div className="chat-popup-tabs">
          <div className="channels-list">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`channel-tab ${selectedChannel?.id === channel.id ? "active" : ""}`}
              >
                # {channel.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewChannelModal(true)}
            className="new-channel-btn"
            title="New Channel"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Messages Area */}
        {selectedChannel ? (
          <>
            <div className="chat-popup-messages">
              {isLoading && (
                <div className="loading-state">
                  <p>Loading messages...</p>
                </div>
              )}

              {messages.length === 0 && !isLoading && (
                <div className="empty-chat-state">
                  <p>No messages yet</p>
                  <span>Start the conversation!</span>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message ${
                    message.authorId === user?.id ? "own-message" : "other-message"
                  }`}
                >
                  {message.authorId !== user?.id && message.author && (
                    <img
                      src={message.author.image || "https://via.placeholder.com/36"}
                      alt={message.author.fullName}
                      className="message-avatar"
                    />
                  )}
                  <div className="message-bubble-wrapper">
                    {message.authorId !== user?.id && message.author && (
                      <p className="message-author">{message.author.fullName}</p>
                    )}
                    <div className="message-bubble">
                      <p>{message.content}</p>
                      <span className="message-time">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-popup-input">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Enter to send)"
                className="message-textarea"
                rows="2"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="send-msg-btn"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="no-channel-state">
            <p>No channels available</p>
          </div>
        )}
      </div>

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <div className="modal-overlay" onClick={() => setShowNewChannelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create New Channel</h4>
            <input
              type="text"
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className="modal-input"
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={() => setShowNewChannelModal(false)} className="modal-cancel">
                Cancel
              </button>
              <button onClick={handleCreateChannel} className="modal-create">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
