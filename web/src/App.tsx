import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatMessage as ChatMessageType } from './types/chat';
import { Newspaper, RotateCcw } from 'lucide-react';

const API_BASE = 'http://localhost:5000';
const PING_INTERVAL_MS = 3000;

export const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiOnline, setAiOnline] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // ── Ping AI her 3 saniyede bir ─────────────────────────────────────────────
  const checkPing = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ping`, { signal: AbortSignal.timeout(2000) });
      setAiOnline(res.ok);
    } catch {
      setAiOnline(false);
    }
  }, []);

  useEffect(() => {
    checkPing();
    const interval = setInterval(checkPing, PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkPing]);

  // ── Sohbet başlat ──────────────────────────────────────────────────────────
  const handleStart = () => {
    setChatStarted(true);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Merhaba! Size nasıl yardımcı olabilirim? Haber arşivinde aramak istediğiniz konuyu yazın.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // ── Sıfırla ────────────────────────────────────────────────────────────────
  const handleReset = async () => {
    try {
      await fetch(`${API_BASE}/api/sifirla`, { method: 'POST' });
    } catch { /* sessizce yakala */ }
    setMessages([]);
    setChatStarted(false);
  };

  // ── Mesaj gönder ───────────────────────────────────────────────────────────
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 1 saniye yapay bekleme ile doğal akış
      const [res] = await Promise.all([
        fetch(`${API_BASE}/api/ara`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ soru: text.trim() }),
        }),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const botMessage: ChatMessageType = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.yanit || 'Bir yanıt oluşturulamadı.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.kaynaklar || [],
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errMessage: ChatMessageType = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sunucuya bağlanılamadı. Lütfen Python sunucusunun çalıştığından emin olun.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* ── Üst Bilgi Çubuğu ── */}
      <header className="app-top-bar">
        <div className="brand-section">
          <div className="brand-icon-box">
            <Newspaper size={20} />
          </div>
          <div>
            <h2 className="brand-title">Haber Arama Botu</h2>
          </div>
          <div className={`status-badge ${aiOnline ? 'status-badge-online' : 'status-badge-offline'}`}>
            <span className={`status-dot ${aiOnline ? 'status-dot-active' : 'status-dot-offline'}`} />
            <span>{aiOnline ? 'AI Aktif' : 'Kapalı'}</span>
          </div>
        </div>

        {chatStarted && (
          <button className="icon-btn-reset" onClick={handleReset} title="Yeni Arama">
            <RotateCcw size={15} />
            <span>Sıfırla</span>
          </button>
        )}
      </header>

      {/* ── Karşılama Ekranı ── */}
      {!chatStarted && (
        <WelcomeScreen onStart={handleStart} aiOnline={aiOnline} />
      )}

      {/* ── Chat Ekranı ── */}
      {chatStarted && (
        <main className="chat-view-container">
          <div className="messages-scroll-area">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="thinking-indicator">
                <div className="dot-pulse" />
                <div className="dot-pulse" />
                <div className="dot-pulse" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </main>
      )}
    </div>
  );
};

export default App;
