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

> **Replace the placeholders below with actual screenshots once the app is running.**

### Welcome Screen
<!-- Replace this comment with: ![Welcome Screen](docs/screenshots/welcome.png) -->
```
┌─────────────────────────────────────────┐
│                                         │
│         [ Welcome Screen ]              │
│   Screenshot: docs/screenshots/         │
│              welcome.png                │
│                                         │
└─────────────────────────────────────────┘
```

### Chat Interface
<!-- Replace this comment with: ![Chat Interface](docs/screenshots/chat.png) -->
```
┌─────────────────────────────────────────┐
│                                         │
│         [ Chat Interface ]              │
│   Screenshot: docs/screenshots/         │
│              chat.png                   │
│                                         │
└─────────────────────────────────────────┘
```

### Results Screen
<!-- Replace this comment with: ![Results Screen](docs/screenshots/results.png) -->
```
┌─────────────────────────────────────────┐
│                                         │
│         [ Results Screen ]              │
│   Screenshot: docs/screenshots/         │
│              results.png                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🧠 How It Works

```
User answers questions  →  KeyBERT extracts keywords
         ↓
SentenceTransformer (all-MiniLM-L6-v2) embeds answers
         ↓
Cosine similarity search over 50+ news articles
         ↓
Top-ranked personalized headlines returned to UI
```

1. **The bot asks you ~15 interest questions** via a conversational chat UI
2. **Your answers are embedded** using `sentence-transformers` (`all-MiniLM-L6-v2`)
3. **Semantic similarity** is computed against a curated news database
4. **The most relevant headlines** are ranked and displayed with match scores

---

## 🗂️ Project Structure

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

## ⚙️ Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| **Frontend**| React 18 + TypeScript + Vite                   |
| **Styling**  | Vanilla CSS (minimalist dark theme)            |
| **Backend** | Python + Flask + Flask-CORS                     |
| **AI/NLP**  | `sentence-transformers` (`all-MiniLM-L6-v2`)   |
| **Keywords**| `KeyBERT`                                       |
| **Tensors** | PyTorch                                          |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- pip

### 1. Clone the repo

```bash
git clone https://github.com/Scobrant/haber-arama-bot.git
cd haber-arama-bot
```

### 2. Install Python dependencies

```bash
pip install flask flask-cors sentence-transformers keybert torch
```

### 3. Install frontend dependencies

```bash
cd web
npm install
```

### 4. Run the app

**Option A — One click:**
```
Double-click start.bat
```

**Option B — Manual:**

Terminal 1 (backend):
```bash
cd llm
python main.py
```

Terminal 2 (frontend):
```bash
cd web
npm run dev
```

Then open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📝 Adding Screenshots

To replace the placeholder images:

1. Run the app
2. Take screenshots of each screen
3. Save them to `docs/screenshots/` with these filenames:
   - `welcome.png`
   - `chat.png`
   - `results.png`
4. Replace the placeholder blocks in this README with:
   ```md
   ![Welcome Screen](docs/screenshots/welcome.png)
   ![Chat Interface](docs/screenshots/chat.png)
   ![Results Screen](docs/screenshots/results.png)
   ```

---

## 📄 License

MIT © [Scobrant](https://github.com/Scobrant)
