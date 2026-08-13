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

<img width="1919" height="911" alt="resim" src="https://github.com/user-attachments/assets/d649ad59-041f-44b4-9ac3-337420b14320" />


### Sohbet UI
<img width="1919" height="912" alt="resim" src="https://github.com/user-attachments/assets/a5a95202-8200-4c4d-9b49-c2e122a6829d" />


### Sonuç Ekranı

<img width="1919" height="911" alt="resim" src="https://github.com/user-attachments/assets/84feb197-00c3-4cf0-9321-a8b6b425a256" />



---

## 🧠 Nasıl Çalışır?

```
Kullanıcı soruyu cevapler  →  KeyBERT anahtar kelimeleri alır
         ↓
SentenceTransformer (all-MiniLM-L6-v2) cevapları ekler
         ↓
50'den fazla haberi ilişkilendirir
         ↓
En alakalı haberler sonuç ekranına yansıtır.
```

1. **Bot yaklaşık 15 soruyu** kendi ekranında size sorar 
2. **Cevaplarınızı analiz etmek için** `sentence-transformers` (`all-MiniLM-L6-v2`) kullanılır
3. **Analiz edilen sonuçlar** database ile hesaplanır
4. **En yakın sonuçlar** database ile karşılaştırılıp sunulur. 

---

## 🗂️ Proje Yapısı

```
haber-arama-bot/
├── llm/
│   ├── main.py              # Flask API + AI logic (embedding, scoring)
│   ├── receiver.py          # Utility receiver
│   ├── news_database.json   # News articles database
│   └── newsDatabase.js      # JS version of the database
│
├── web/
│   ├── src/
│   │   ├── App.tsx                      # Main app & state machine
│   │   ├── index.css                    # Global styles (minimalist theme)
│   │   ├── components/
│   │   │   ├── WelcomeScreen.tsx        # Landing / hero screen
│   │   │   ├── ChatMessage.tsx          # Single message bubble
│   │   │   └── ChatInput.tsx            # Textarea + send button
│   │   ├── types/
│   │   │   └── chat.ts                  # TypeScript types
│   │   └── data/
│   │       └── newsDatabase.ts          # Frontend news data
│   ├── package.json
│   └── vite.config.ts
│
├── start.bat                # One-click launcher
├── run_bot.bat              # Alternative launcher
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
