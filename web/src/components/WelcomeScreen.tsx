import React from 'react';
import { Sparkles, Brain, Cpu, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  isLoading?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isLoading }) => {
  return (
    <div className="hero-view-container">
      <div className="hero-badge-pill">
        <Sparkles size={16} />
        <span>Yapay Zeka Destekli Haber Küratörü</span>
      </div>

      <div className="hero-avatar-circle">
        <Brain size={44} />
      </div>

      <h1 className="hero-title-main">
        İlgi Alanlarınıza Özel <br />
        <span className="hero-title-gradient">Haber Algoritması Botu</span>
      </h1>

      <p className="hero-subtitle">
        Akıllı yapay zeka modellerimiz tercihleriniz ve ilgi alanlarınız hakkında sorular sorar, en güncel haber veritabanı arasından size en uygun başlıkları eşleştirir.
      </p>

      <div className="features-grid">
        <div className="feature-pill">
          <Brain size={16} />
          <span>Doğal Dil Analizi</span>
        </div>
        <div className="feature-pill">
          <Cpu size={16} />
          <span>Vektörel Semantik Eşleşme</span>
        </div>
        <div className="feature-pill">
          <Sparkles size={16} />
          <span>Kişiselleştirilmiş Akış</span>
        </div>
      </div>

      <button className="btn-start-hero" onClick={onStart} disabled={isLoading}>
        <span>{isLoading ? 'Başlatılıyor...' : 'Testi Başlat'}</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

