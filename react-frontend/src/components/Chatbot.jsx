import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm IntelliCart's AI assistant. How can I help you today?",
      isUser: false,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const closeChatbot = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setMessages((prev) => [...prev, { text: inputValue, isUser: true }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: inputValue,
      });

      setMessages((prev) => [
        ...prev,
        { text: response.data.response, isUser: false },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong. Please try again later.", isUser: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isSmallScreen = window.innerWidth < 400;

  return (
    <div>
      <style jsx>{`
        .chatbot-toggle {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1050;
          transition: all 0.3s ease;
        }
        .chatbot-toggle:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }
        .chat-window {
          position: fixed;
          bottom: 5rem;
          right: 1rem;
          width: ${isSmallScreen ? "calc(100vw - 2rem)" : "400px"};
          height: 550px;
          max-height: calc(100vh - 7rem);
          max-width: calc(100vw - 2rem);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          display: ${isOpen ? "flex" : "none"};
          flex-direction: column;
          z-index: 1050;
          overflow: hidden;
        }
        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }
        .chat-header-text {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }
        .chat-subheader {
          margin: 0;
          font-size: 0.8rem;
          opacity: 0.8;
        }
        .close-button {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        .close-button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }
        .messages-container {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          min-height: 0;
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
          background: #f8f9fa;
        }
        .user-message {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1rem;
        }
        .bot-message {
          display: flex;
          margin-bottom: 1rem;
        }
        .message-bubble {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          max-width: 85%;
          word-wrap: break-word;
          word-break: break-word;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .user-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .bot-bubble {
          background: white;
          color: #212529;
          border: 1px solid #e9ecef;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .input-container {
          border-top: 1px solid #dee2e6;
          padding: 1rem;
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
          background: white;
        }
        .chat-input {
          flex: 1;
          border-radius: 25px;
          padding: 0.5rem 1rem;
          border: 1px solid #ced4da;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .chat-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        .send-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .send-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
        .loading {
          font-style: italic;
          color: #6c757d;
          text-align: center;
          padding: 0.5rem;
        }
        .markdown ul, .markdown ol {
          padding-left: 1.5rem;
        }
        .markdown a {
          color: #667eea;
          text-decoration: underline;
        }
        .markdown a:hover {
          text-decoration: none;
          color: #764ba2;
        }
        .markdown strong {
          font-weight: 600;
        }
      `}</style>

      <button
        className="chatbot-toggle"
        onClick={toggleChatbot}
      >
        <i className={`bi ${isOpen ? "bi-x" : "bi-chat"}`} style={{ fontSize: '1.5rem' }}></i>
      </button>

      <div className="chat-window">
        <div className="chat-header">
          <div>
            <h3 className="chat-header-text">IntelliCart AI Assistant</h3>
            <p className="chat-subheader">Online | 24/7 Support</p>
          </div>
          <button
            className="close-button"
            onClick={closeChatbot}
          >
            <i className="bi bi-x" style={{ fontSize: '1.25rem' }}></i>
          </button>
        </div>

        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={message.isUser ? "user-message" : "bot-message"}
            >
              <div
                className={`message-bubble ${message.isUser ? "user-bubble" : "bot-bubble"}`}
              >
                {message.isUser ? (
                  <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.5" }}>
                    {message.text}
                  </p>
                ) : (
                  <div className="markdown">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="loading">
              Typing<span>.</span><span>.</span><span>.</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button
            type="submit"
            className="send-button"
            disabled={!inputValue.trim()}
          >
            <i className="bi bi-send" style={{ fontSize: '1rem' }}></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;