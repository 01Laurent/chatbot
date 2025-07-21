import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function ChatBox() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage = { user: true, text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/api/chat/message", {
                message: userMessage.text,
            });
            setMessages((prev) => [...prev, { user: false, text: res.data.reply }]);
        } catch (err) {
            setMessages((prev) => [...prev, { user: false, text: "Error from AI." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg" style={{ maxWidth: "600px", margin: "0 auto" }}>
                <div className="card-header bg-success text-white text-center fw-bold">
                    Delivery Assistant
                </div>
                <div className="card-body" style={{ height: "400px", overflowY: "auto" }}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`d-flex mb-3 ${msg.user ? "justify-content-end" : "justify-content-start"}`}>
                            <div
                                className={`p-2 rounded-3 shadow-sm ${msg.user ? "bg-warning text-white" : "bg-light text-dark"}`}
                                style={{ maxWidth: "75%" }}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="card-footer">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ask about anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        <button
                            className="btn btn-dark"
                            onClick={sendMessage}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                                "Send"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatBox;
