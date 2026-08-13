import React from 'react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import { Bot, User } from 'lucide-react';

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
      </div>
    </div>
  );
};

