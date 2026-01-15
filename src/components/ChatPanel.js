import React from 'react';
import './ChatPanel.css';

function ChatPanel({ chatData, loading, error }) {
    if (loading) {
        return (
            <div className="chat-panel loading">
                <div className="spinner"></div>
                <p>Les experts (Llama 3.2) réfléchissent...</p>
            </div>
        );
    }

    if (error) {
        return <div className="chat-panel error">⚠️ {error}</div>;
    }

    if (!chatData || !chatData.responses) return null;

    return (
        <div className="chat-panel">
            <h3>💬 L'avis des Experts sur : <span className="capitalize">{chatData.fruit}</span></h3>

            <div className="chat-feed">
                {chatData.responses.map((msg, index) => {
                    const isBotanist = msg.agent === "Botanist";
                    return (
                        <div key={index} className={`chat-bubble ${isBotanist ? 'botanist' : 'chef'}`}>
                            <div className="chat-avatar">
                                {isBotanist ? "🌿" : "👨‍🍳"}
                            </div>
                            <div className="chat-content">
                                <strong>{isBotanist ? "Le Botaniste" : "Le Chef"}</strong>
                                <div className="chat-text">
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ChatPanel;