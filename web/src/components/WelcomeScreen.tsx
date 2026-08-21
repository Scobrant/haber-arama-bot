import React from 'react';
import { Search, Brain, Cpu, ArrowRight, Newspaper } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  isLoading?: boolean;
  aiOnline: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isLoading, aiOnline }) => {
  return (
    <div className="hero-view-container">
      <div className="hero-badge-pill">
        <Search size={16} />
        <span>Yapay Zeka Destekli Haber Arama</span>
      </div>

      <div className="hero-avatar-circle">
        <Newspaper size={44} />
      </div>

      <h1 className="hero-title-main">
        Doğal Dille Haber Ara, <br />
        <span className="hero-title-gradient">Anında Sonuç Al</span>
      </h1>

      <p className="hero-subtitle">
        Aklınızdaki konuyu kendi cümlelerinizle yazın. Yapay zeka haber
        arşivini anlayıp size en alakalı başlıkları kaynaklarıyla birlikte sunar.
      </p>

      <div className="features-grid">
        <div className="feature-pill">
          <Brain size={16} />
          <span>Semantik Anlama</span>
        </div>
        <div className="feature-pill">
          <Cpu size={16} />
          <span>Vektör Arama</span>
        </div>
        <div className="feature-pill">
          <Search size={16} />
          <span>Kaynaklı Yanıt</span>
        </div>
      </div>

      <button
        className="btn-start-hero"
        onClick={onStart}
        disabled={isLoading || !aiOnline}
        title={!aiOnline ? 'AI servisi çevrimdışı. Lütfen Python sunucusunu başlatın.' : ''}
      >
        <span>
          {isLoading
            ? 'Başlatılıyor...'
            : !aiOnline
            ? 'AI Kapalı — Sunucu Bekleniyor'
            : 'Aramaya Başla'}
        </span>
        <ArrowRight size={20} />
      </button>

      {!aiOnline && (
        <p className="hero-offline-hint">
          Lütfen arka planda <code>python main.py</code> komutunu çalıştırın.
        </p>
      )}
    </div>
  );
};
