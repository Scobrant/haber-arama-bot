import sys
import os
import json
import re
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util

# Reconfigure stdout for UTF-8 on Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

print("[AI] Modeller yükleniyor, lütfen bekleyin...")
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

embed_model = SentenceTransformer("all-MiniLM-L6-v2")
print("[AI] Modeller başarıyla yüklendi!\n")

# Flask API Kurulumu
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Haber veritabanını yükle
db_path = os.path.join(current_dir, "news_database.json")
if os.path.exists(db_path):
    with open(db_path, "r", encoding="utf-8") as f:
        NEWS_DATABASE = json.load(f)
else:
    raise FileNotFoundError(f"Haber veritabanı dosyası bulunamadı: {db_path}")

STOPWORDS = {
    've', 'ile', 'de', 'da', 'haber', 'haberi', 'haberleri', 'teknoloji', 'teknolojisi',
    'hakkinda', 'ilgili', 'son', 'yeni', 'en', 'icin', 'nasil', 'nedir', 'neden',
    'mi', 'mu', 'mu', 'var', 'olan', 'gibi', 'kadar', 'bir', 'bu', 'su', 'o'
}

SYNONYMS = {
    'giyilebilir': ['giyilebilir', 'akilli saat', 'akilli gozluk', 'akilli bileklik', 'akilli yuzuk', 'watch', 'wearable'],
    'saat': ['akilli saat', 'giyilebilir', 'watch', 'smartwatch'],
    'bilgisayar': ['bilgisayar', 'laptop', 'dizustu', 'islemci', 'donanim', 'pc'],
    'ekran karti': ['ekran karti', 'rtx', 'gpu', 'nvidia', 'grafik islemci'],
    'telefon': ['telefon', 'akilli telefon', 'iphone', 'android', 'samsung', 'xiaomi', 'mobil'],
    'oyun': ['oyun', 'gta', 'playstation', 'xbox', 'steam', 'konsol'],
    'uzay': ['uzay', 'teleskop', 'nasa', 'astronomi', 'mars', 'james webb', 'gezegen'],
    'kripto': ['kripto', 'bitcoin', 'ethereum', 'btc', 'coin'],
    'araba': ['otomobil', 'araba', 'elektrikli arac', 'togg', 'tesla', 'surucusuz']
}

# Türkçe karakter normalizasyonu
def normalize_tr(text: str) -> str:
    t = text.lower()
    t = t.replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ö', 'o').replace('ç', 'c')
    return t

# Tüm başlıkların embedding'lerini ve normalize hallerini hesapla
headline_texts = [item["headline"] for item in NEWS_DATABASE]
normalized_headlines = [normalize_tr(h) for h in headline_texts]
headline_embeddings = embed_model.encode(headline_texts, convert_to_tensor=True)
print(f"[AI] {len(NEWS_DATABASE)} haber indekslendi ve arama için hazır.\n")


def hybrid_search(soru: str, top_k: int = 3):
    """
    Stopword filtreleme, eş anlamlı genişletme ve semantik vektör eşleşmeli akıllı arama.
    """
    q_norm = normalize_tr(soru)
    raw_words = [w for w in re.findall(r'[a-zA-Z0-9]+', q_norm) if len(w) > 1]
    
    # Bilgi içeren anahtar kelimeleri ayıkla
    informative_words = [w for w in raw_words if w not in STOPWORDS]
    search_words = informative_words if informative_words else raw_words
    
    # Eş anlamlıları genişlet
    expanded_terms = set(search_words)
    for kw, syns in SYNONYMS.items():
        if kw in q_norm or any(w == kw for w in search_words):
            for s in syns:
                expanded_terms.add(s)
                for sw in s.split():
                    expanded_terms.add(sw)
    
    # 1. Semantik Benzerlik
    q_emb = embed_model.encode(soru, convert_to_tensor=True)
    cosine_scores = util.cos_sim(q_emb, headline_embeddings)[0].cpu().numpy()
    
    scored_items = []
    for idx, item in enumerate(NEWS_DATABASE):
        h_norm = normalized_headlines[idx]
        
        # Kelime eşleşme skoru
        direct_matches = sum(1 for w in search_words if w in h_norm)
        direct_word_bonus = (direct_matches / len(search_words)) * 0.8 if search_words else 0.0
        
        # Eş anlamlı terim eşleşme skoru
        syn_matches = sum(1 for term in expanded_terms if term in h_norm)
        syn_bonus = min(syn_matches * 0.25, 0.6)
        
        # Tam ifade eşleşme bonusu
        phrase_bonus = 0.6 if (len(search_words) > 1 and q_norm in h_norm) else 0.0
        
        final_score = float(cosine_scores[idx]) * 0.4 + direct_word_bonus + syn_bonus + phrase_bonus
        scored_items.append((final_score, idx))
        
    scored_items.sort(key=lambda x: x[0], reverse=True)
    
    kaynaklar = []
    for score_val, idx in scored_items[:top_k]:
        news_item = NEWS_DATABASE[idx]
        kaynaklar.append({
            "headline": news_item["headline"],
            "source": news_item["source"],
            "url": news_item["url"],
            "score": round(min(score_val * 100, 99.0), 1)
        })
    return kaynaklar


def generate_answer(query: str, results: list) -> str:
    """
    Kısa ve öz Türkçe yanıt metni.
    """
    if not results:
        return "Bu konuyla ilgili arşivde haber bulunamadı."

    count = len(results)
    return f"Aramanızla ilgili {count} güncel haber bulundu:"


# ─── Endpoint'ler ────────────────────────────────────────────────────────────

@app.route('/api/ping', methods=['GET'])
def api_ping():
    """Sağlık kontrolü — frontend bu endpoint'e ping atarak AI durumunu öğrenir."""
    return jsonify({"status": "ok"}), 200


@app.route('/api/ara', methods=['POST'])
def api_ara():
    """
    Kullanıcının doğal dil sorgusunu alır, akıllı hibrit arama yapar ve
    kısa yanıt + ilgili haber başlıklarını döndürür.
    """
    try:
        data = request.json or {}
        soru = (data.get('soru') or data.get('query') or '').strip()

        if not soru:
            return jsonify({"hata": "Soru boş olamaz."}), 400

        print(f"[ARA] Sorgu: '{soru}'")
        kaynaklar = hybrid_search(soru, top_k=3)
        yanit = generate_answer(soru, kaynaklar)
        print(f"[ARA] {len(kaynaklar)} sonuç bulundu.")

        return jsonify({
            "yanit": yanit,
            "kaynaklar": kaynaklar
        }), 200

    except Exception as e:
        print(f"[HATA] Arama sırasında hata: {e}")
        return jsonify({"hata": str(e)}), 500


@app.route('/api/sifirla', methods=['POST'])
def api_sifirla():
    """Konuşmayı sıfırla."""
    print("[API] Konuşma sıfırlandı.")
    return jsonify({"status": "ok"}), 200


# ─── Başlangıç ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print("[API] Flask Sunucusu 0.0.0.0:5000 adresinde başlatılıyor...")
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
