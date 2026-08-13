import sys
import os
import threading
import time
import re
import torch
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
from keybert import KeyBERT

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
kw_model = KeyBERT(model=embed_model)
print("[AI] Modeller başarıyla yüklendi!\n")

# Flask API Kurulumu
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

paylasilan_veri = {
    "durum": "bekliyor",  # 'bekliyor', 'basladi', 'bitti'
    "aktif_soru": "",
    "trimmed": "",
    "sonuclar": [],
    "soru_index": 0,
    "reset_requested": False
}

QUESTIONS = [
    "Hangi teknoloji ve yazılım konularını takip ediyorsunuz? (örn: Yapay zeka, mobil, donanım)",
    "Yeşil enerji ve yenilenebilir kaynaklar hakkında ne düşünüyorsunuz?",
    "Küresel ekonomi, piyasalar veya borsa gelişmelerini takip eder misiniz?",
    "Uzay araştırmaları ve keşif görevleri ilginizi çekiyor mu?",
    "Siber güvenlik ve veri gizliliği konusundaki gelişmeler ne kadar ilginizi çekiyor?",
    "Hangi bilimsel buluşlar veya teknolojik yenilikler heyecanınızı artırıyor?",
    "Elektrikli araçlar ve geleceğin ulaşım teknolojileri hakkında düşünceleriniz nelerdir?",
    "Sağlık, tıp ve biyoteknoloji alanındaki gelişmeleri takip eder misiniz?",
    "Sürdürülebilirlik ve çevre sorunları (iklim değişikliği, geri dönüşüm vb.) sizin için ne kadar önemli?",
    "Yapay zeka ve otomasyonun iş dünyasına ve günlük hayata etkisi hakkında ne düşünüyorsunuz?",
    "Savunma sanayii ve havacılık alanındaki yerli gelişmeleri takip eder misiniz?",
    "Arkeoloji, tarih ve doğa araştırmaları ilginizi çeker mi?",
    "Kripto varlıklar, dijital cüzdanlar ve finansal teknolojiler hakkındaki görüşünüz nedir?",
    "Giyilebilir teknolojiler ve akıllı aksesuarlar kullanıyor musunuz?",
    "Otonom sürüş ve insansız araç sistemleri hakkında ne düşünüyorsunuz?"
]

MIN_QUESTIONS = 10
CONFIDENCE_THRESHOLD = 0.85

db_path = os.path.join(current_dir, "news_database.json")
if os.path.exists(db_path):
    with open(db_path, "r", encoding="utf-8") as f:
        NEWS_DATABASE = json.load(f)
else:
    raise FileNotFoundError(f"Haber veritabanı dosyası bulunamadı: {db_path}")

headline_texts = [item["headline"] for item in NEWS_DATABASE]
headline_embeddings = embed_model.encode(headline_texts, convert_to_tensor=True)

EXIT_TRIGGERS = [
    "aklıma başka bir şey gelmiyor", "aklıma başka birşey gelmiyor", "aklıma başka gelmiyor", 
    "aklıma bir şey gelmiyor", "aklıma birşey gelmiyor", "aklıma gelmiyor", "aklımda yok", 
    "başka aklımda yok", "aklımda başka yok", "başka aklıma gelmiyor", "her şeyi söyledim", 
    "herşeyi söyledim", "hepsini söyledim", "söyledim hepsi bu", "başka yok", "başka bir şey yok", 
    "başka bişey yok", "başka birşey yok", "başka kalmadı", "bu kadar", "bu kadardı", "hepsi bu", 
    "hepsi bu kadar", "bu kadar yani", "tüm bildiklerim bu kadar", "tümü bu kadar", "bildiklerim bu kadar",
    "şimdi göster", "göster bana", "haberleri göster", "sonuçları göster", "artık göster",
    "haber getir", "haber göster", "arama yap", "göster", "yeterli", "yeter", "bitti", 
    "tamamdır", "tamam", "kes", "dur", "sonuçlar", "ara", "no more questions", "now show me", 
    "show me", "no more", "stop", "done", "skip", "pass", "geç", "nothing else", "that's all"
]
EXIT_TRIGGERS.sort(key=len, reverse=True)

def contains_exit_trigger(text: str) -> tuple[bool, str]:
    cleaned = text.strip()
    lowered = cleaned.lower()
    if not lowered:
        return False, cleaned
    for kw in EXIT_TRIGGERS:
        pattern = r'(?i)(?:\b|^)' + re.escape(kw) + r'(?:\b|$)'
        match = re.search(pattern, lowered)
        if match:
            start, end = match.span()
            remaining = (cleaned[:start] + " " + cleaned[end:]).strip()
            return True, " ".join(remaining.split())
    return False, cleaned

def sonuclari_raporla(user_answers):
    combined_text = " ".join(user_answers).strip()
    if not combined_text:
        combined_text = "teknoloji bilim haberleri genel gündem yapay zeka"

    user_embedding = embed_model.encode(combined_text, convert_to_tensor=True)
    cosine_scores = util.cos_sim(user_embedding, headline_embeddings)[0]
    top_results = torch.topk(cosine_scores, k=min(3, len(NEWS_DATABASE)))

    haber_listesi = []
    for score, idx in zip(top_results.values, top_results.indices):
        news_item = NEWS_DATABASE[idx.item()]
        haber_listesi.append({
            "headline": news_item["headline"],
            "source": news_item["source"],
            "url": news_item["url"],
            "score": round(score.item() * 100, 1)
        })
    
    paylasilan_veri["sonuclar"] = haber_listesi
    paylasilan_veri["durum"] = "bitti"

# Flask Rotaları
@app.route('/api/basla', methods=['POST'])
def api_basla():
    paylasilan_veri["durum"] = "basladi"
    paylasilan_veri["aktif_soru"] = ""
    paylasilan_veri["trimmed"] = ""
    paylasilan_veri["sonuclar"] = []
    paylasilan_veri["soru_index"] = 0
    paylasilan_veri["reset_requested"] = True
    print("\n[API] Test başlatıldı!")
    return jsonify({"status": "ok", "message": "Test başlatıldı"}), 200

@app.route('/api/soru-getir', methods=['GET'])
def api_soru_getir():
    return jsonify({
        "durum": paylasilan_veri["durum"],
        "soru": paylasilan_veri["aktif_soru"],
        "sonuclar": paylasilan_veri["sonuclar"],
        "soru_index": paylasilan_veri["soru_index"],
        "toplam_soru": len(QUESTIONS)
    }), 200

@app.route('/api/ayarla', methods=['POST'])
def api_ayarla():
    try:
        data = request.json or {}
        metin = data.get('text') or data.get('kelime') or ""
        metin = metin.strip()
        if metin:
            paylasilan_veri["trimmed"] = metin
            print(f"[API] Gelen yanıt: '{metin}'")
        return jsonify({"status": "basarili", "received": metin}), 200
    except Exception as e:
        print(f"[HATA] İstek işlenirken hata oluştu: {e}")
        return jsonify({"status": "hata", "mesaj": str(e)}), 400

@app.route('/api/sifirla', methods=['POST'])
def api_sifirla():
    paylasilan_veri["durum"] = "bekliyor"
    paylasilan_veri["aktif_soru"] = ""
    paylasilan_veri["trimmed"] = ""
    paylasilan_veri["sonuclar"] = []
    paylasilan_veri["soru_index"] = 0
    paylasilan_veri["reset_requested"] = True
    print("\n[API] Test sıfırlandı.")
    return jsonify({"status": "ok"}), 200

def sunucuyu_baslat():
    print("[API] Flask Sunucusu 0.0.0.0:5000 adresinde başlatılıyor...")
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)

def main_loop():
    flask_thread = threading.Thread(target=sunucuyu_baslat, daemon=True)
    flask_thread.start()

    print("[SİSTEM] React'tan 'Başla' butonuna basılması bekleniyor...")

    while True:
        while paylasilan_veri["durum"] != "basladi":
            time.sleep(0.3)

        print("\n[SİSTEM] Soru oturumu başlatıldı!")
        paylasilan_veri["reset_requested"] = False
        user_answers = []

        for i, question in enumerate(QUESTIONS):
            if paylasilan_veri["reset_requested"] or paylasilan_veri["durum"] != "basladi":
                break

            paylasilan_veri["aktif_soru"] = question
            paylasilan_veri["soru_index"] = i + 1
            print(f"\n[SORU {i+1}/{len(QUESTIONS)}] {question}")

            while paylasilan_veri["trimmed"] == "" and not paylasilan_veri["reset_requested"] and paylasilan_veri["durum"] == "basladi":
                time.sleep(0.15)

            if paylasilan_veri["reset_requested"] or paylasilan_veri["durum"] != "basladi":
                break

            raw_answer = paylasilan_veri["trimmed"]
            paylasilan_veri["trimmed"] = ""

            has_trigger, extra_content = contains_exit_trigger(raw_answer)
            if extra_content:
                user_answers.append(extra_content)

            if has_trigger:
                print("[SİSTEM] Erken çıkış ifadesi algılandı!")
                break

            if (i + 1) >= MIN_QUESTIONS and user_answers:
                current_combined = " ".join(user_answers).strip()
                if current_combined:
                    curr_emb = embed_model.encode(current_combined, convert_to_tensor=True)
                    curr_scores = util.cos_sim(curr_emb, headline_embeddings)[0]
                    max_confidence = torch.max(curr_scores).item()
                    if max_confidence >= CONFIDENCE_THRESHOLD:
                        print(f"[SİSTEM] Güven eşiği sağlandı (%{max_confidence*100:.1f})")
                        break

        if not paylasilan_veri["reset_requested"] and paylasilan_veri["durum"] == "basladi":
            print("[SİSTEM] Haberler analiz ediliyor...")
            sonuclari_raporla(user_answers)
            print("[SİSTEM] Haber analizi tamamlandı, sonuçlar hazır!")

if __name__ == '__main__':
    main_loop()

