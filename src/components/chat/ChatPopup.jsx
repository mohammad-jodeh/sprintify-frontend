import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Plus } from "lucide-react";
import io from "socket.io-client";
import { getChatChannels, getChatMessages, sendChatMessage, createChatChannel } from "../../api/chat";
import useAuthStore from "../../store/authstore";
import "./ChatPopup.css";

const ChatPopup = ({ projectId }) => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const messagesEndRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("Chat popup connected");
    });

    newSocket.on("message-received", (data) => {
      if (data.channelId === selectedChannel?.id) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id || Math.random(),
            ...data,
            createdAt: data.createdAt || new Date(),
          },
        ]);
      }
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [selectedChannel?.id]);

  // Fetch channels
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

  // Fetch messages when channel changes
  useEffect(() => {
    if (!selectedChannel) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await getChatMessages(selectedChannel.id);
        setMessages(response.data);
        socket?.emit("join-channel", selectedChannel.id);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchMessages();
    }
  }, [selectedChannel, isOpen, socket]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel) return;

    try {
      await sendChatMessage({
        channelId: selectedChannel.id,
        content: messageInput,
      });
      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
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
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`chat-floating-button ${isOpen ? "open" : ""}`}
        title="Open Chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="chat-popup-container">
          <div className="chat-popup">
            {/* Header */}
            <div className="chat-popup-header">
              <h3>Project Chat</h3>
              <button
                onClick={() => setIsOpen(false)}
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
                      <MessageCircle size={32} />
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
      )}
    </>
  );
};

export default ChatPopup;
