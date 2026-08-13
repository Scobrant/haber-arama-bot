import React, { useState, useEffect, useRef } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatMessage as ChatMessageType } from './types/chat';
import { Sparkles, Newspaper, RotateCcw, ExternalLink, CheckCircle2 } from 'lucide-react';

interface HaberResult {
  headline: string;
  source: string;
  url: string;
  score: number;
}

export const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [appStatus, setAppStatus] = useState<'bekliyor' | 'basladi' | 'bitti'>('bekliyor');
  const [news, setNews] = useState<HaberResult[]>([]);
  const [soruIndex, setSoruIndex] = useState<number>(0);
  const [toplamSoru, setToplamSoru] = useState<number>(15);
  const [isWaitingForNext, setIsWaitingForNext] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastQuestionRef = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaitingForNext]);

  // Python sunucusu durumunu ve sorusunu düzenli olarak kontrol eder
  useEffect(() => {
    const checkPythonStatus = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/soru-getir');
        if (!res.ok) return;

        const data = await res.json();
        setAppStatus(data.durum);

        if (data.soru_index) setSoruIndex(data.soru_index);
        if (data.toplam_soru) setToplamSoru(data.toplam_soru);

        if (data.durum === 'basladi' && data.soru) {
          // Eğer bu soru henüz chat'e eklenmediyse ekle
          if (lastQuestionRef.current !== data.soru) {
            lastQuestionRef.current = data.soru;
            setIsWaitingForNext(false);

            const systemQuestion: ChatMessageType = {
              id: `sys-${data.soru_index}-${Date.now()}`,
              role: 'assistant',
              content: data.soru,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, systemQuestion]);
          }
        }

        if (data.durum === 'bitti') {
          setIsWaitingForNext(false);
          if (data.sonuclar && data.sonuclar.length > 0) {
            setNews(data.sonuclar);
          }
        }
      } catch (err) {
        // Python sunucusu kapalıysa sessizce yakala
      }
    };

    const interval = setInterval(checkPythonStatus, 800);
    return () => clearInterval(interval);
  }, []);

  // Testi başlatır
  const handleStartBot = async () => {
    setIsStarting(true);
    try {
      const res = await fetch('http://localhost:5000/api/basla', { method: 'POST' });
      if (res.ok) {
        setMessages([]);
        setNews([]);
        lastQuestionRef.current = '';
        setAppStatus('basladi');
      } else {
        alert("Python sunucusuna bağlanılamadı. Lütfen 'python main.py' komutunun çalıştığından emin olun!");
      }
    } catch (err) {
      alert("Lütfen önce arka planda Python (main.py) sistemini çalıştırın!");
    } finally {
      setIsStarting(false);
    }
  };

  // Testi sıfırlar
  const handleResetBot = async () => {
    try {
      await fetch('http://localhost:5000/api/sifirla', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
    setMessages([]);
    setNews([]);
    lastQuestionRef.current = '';
    setAppStatus('bekliyor');
    setSoruIndex(0);
    setIsWaitingForNext(false);
  };

  // Kullanıcı mesajını Python sunucusuna gönderir
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsWaitingForNext(true);

    try {
      await fetch('http://localhost:5000/api/ayarla', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text: text.trim() }),
      });
    } catch (error) {
      console.error("[React] Veri gönderme başarısız:", error);
      setIsWaitingForNext(false);
    }
  };

  const progressPercent = Math.min(100, Math.round((soruIndex / (toplamSoru || 15)) * 100));

  return (
    <div className="app-container">
      {/* Üst Bilgi Çubuğu */}
      <header className="app-top-bar">
        <div className="brand-section">
          <div className="brand-icon-box">
            <Newspaper size={20} />
          </div>
          <div>
            <h2 className="brand-title">Haber Arama Botu</h2>
          </div>
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>AI Aktif</span>
          </div>
        </div>

        {appStatus === 'basladi' && (
          <div className="progress-container">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="progress-text">Soru {soruIndex} / {toplamSoru}</span>
          </div>
        )}

        {appStatus !== 'bekliyor' && (
          <button className="icon-btn-reset" onClick={handleResetBot} title="Yeniden Başlat">
            <RotateCcw size={15} />
            <span>Sıfırla</span>
          </button>
        )}
      </header>

      {/* Bekliyor: Başlangıç Ekranı */}
      {appStatus === 'bekliyor' && (
        <WelcomeScreen onStart={handleStartBot} isLoading={isStarting} />
      )}

      {/* Başladı: Soru - Cevap Chat Ekranı */}
      {appStatus === 'basladi' && (
        <main className="chat-view-container">
          <div className="messages-scroll-area">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isWaitingForNext && (
              <div className="thinking-indicator">
                <div className="dot-pulse"></div>
                <div className="dot-pulse"></div>
                <div className="dot-pulse"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSendMessage={handleSendMessage} isLoading={isWaitingForNext} />
        </main>
      )}

      {/* Bitti: Sonuç Ekranı */}
      {appStatus === 'bitti' && (
        <div className="results-view-container">
          <div className="results-header-card">
            <div className="results-badge-icon">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="results-title">Sizin İçin Seçilen En Uyumlu Haberler</h2>
            <p className="results-desc">
              Verdiğiniz yanıtlar yapay zeka vektör eşleştirme algoritmasıyla analiz edildi ve 50+ haber arasından size özel en alakalı başlıklar seçildi.
            </p>
          </div>

          <div className="news-cards-list">
            {news.map((item, idx) => (
              <div key={idx} className="news-card-item">
                <div className="news-card-top-row">
                  <span className="score-badge">
                    <Sparkles size={13} />
                    %{item.score} Uyum
                  </span>
                  <span className="source-tag">[{item.source}]</span>
                </div>
                <h3 className="news-headline">{item.headline}</h3>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="news-link-btn"
                >
                  <span>Habere Oku</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>

          <button className="btn-restart-results" onClick={handleResetBot}>
            <RotateCcw size={18} />
            <span>Yeni Analiz Başlat</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

