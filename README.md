<div align="center">

# 🗞️ Haber Arama Botu

**An AI-powered personalized news recommender — chat with the bot, get news tailored to your interests.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-API-000000?style=flat&logo=flask)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

</div>

---

## 📸 Screenshots


### Hoşgeldin Ekranı

<img width="1919" height="915" alt="resim" src="https://github.com/user-attachments/assets/64ab1f76-5ea5-4576-8bed-0633e725ba9d" />


### Sohbet UI
<img width="1919" height="915" alt="resim" src="https://github.com/user-attachments/assets/0c00cec0-53c7-4762-af4e-aa4bb9e6c87c" />

### Sonuç Ekranı

<img width="1909" height="915" alt="resim" src="https://github.com/user-attachments/assets/5e9adaec-209e-4029-89fb-151385205ca9" />


---

## 🧠 Nasıl Çalışır?

```
Kullanıcı soru sorar  →  KeyBERT anahtar kelimeleri alır
         ↓
SentenceTransformer (all-MiniLM-L6-v2) cevapları ekler
         ↓
50'den fazla haberi ilişkilendirir
         ↓
En alakalı haberler sonuç ekranına yansıtır.
```

1. **Bot sorulan soruyu** kelimelere böler 
2. **Kelimelerinizi analiz etmek için** `sentence-transformers` (`all-MiniLM-L6-v2`) kullanılır
3. **Analiz edilen sonuçlar** database ile hesaplanır
4. **En yakın sonuçlar** database ile karşılaştırılıp sunulur. 

---

## 🗂️ Proje Yapısı

```
haber-arama-bot/
├── llm/
│   ├── main.py              
│   ├── receiver.py         
│   ├── news_database.json   
│   └── newsDatabase.js      
│
├── web/
│   ├── src/
│   │   ├── App.tsx                      # Ana uygulama
│   │   ├── index.css                    # Stil
│   │   ├── components/
│   │   │   ├── WelcomeScreen.tsx        # Giriş ve Hoşgeldin ekranı
│   │   │   ├── ChatMessage.tsx          # Tekli mesaj balonları
│   │   │   └── ChatInput.tsx            # Sohbet Mesaj alanı
│   │   ├── types/
│   │   │   └── chat.ts                  
│   │   └── data/
│   │       └── newsDatabase.ts          # Database
│   ├── package.json
│   └── vite.config.ts
│
├── start.bat                # Ana başlatıcı
├── run_bot.bat              # Alternatif
└── .gitignore
```

---

## ⚙️ Tercih edilen teknolojiler

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| **Frontend**| React 18 + TypeScript + Vite                   |
| **Stil**  | Vanilla CSS (minimalist dark theme)            |
| **Backend** | Python + Flask + Flask-CORS                     |
| **AI/NLP**  | `sentence-transformers` (`all-MiniLM-L6-v2`)   |
| **Kelime**| `KeyBERT`                                       |
| **Tensör** | PyTorch                                          |

---

## 📄 License

MIT © [Scobrant](https://github.com/Scobrant)
