import React from 'react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import { Bot, User, ExternalLink, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className="msg-avatar">
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div className="message-content-box">
        <div className="message-body">
          <span className="message-text">{message.content}</span>
          <span className="message-timestamp-bottom">{message.timestamp}</span>
        </div>

        {/* Kaynak haber kartları — yalnızca bot mesajlarında ve kaynaklar varsa */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="source-cards-list">
            {message.sources.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="source-card"
              >
                <div className="source-card-top">
                  <span className="source-score-badge">
                    <Sparkles size={11} />
                    %{src.score.toFixed(0)}
                  </span>
                  <span className="source-tag-small">{src.source}</span>
                </div>
                <p className="source-headline">{src.headline}</p>
                <span className="source-read-link">
                  Haberi Oku <ExternalLink size={12} />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
