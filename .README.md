# CurrHub — AI Curriculum Generator (Production)
### React + Flask + IBM Granite 3.3 2B (via Ollama)

---

## Project Structure

```
currhub_project/
├── backend/
│   ├── app.py              ← Flask API server (all routes, AI, exports)
│   └── requirements.txt    ← Python dependencies
└── frontend/
    ├── src/
    │   ├── index.js         ← React entrypoint
    │   └── CurrHub.jsx      ← Complete React app (single file)
    ├── public/
    │   └── index.html       ← HTML shell
    └── package.json         ← npm config + "proxy": "http://localhost:5000"
```

---

## One-Time Setup

### 1. Install Ollama + IBM Granite model
```bash
# Install Ollama from https://ollama.ai
ollama pull granite3.2:2b
```

### 2. Backend setup
```bash
cd currhub_project/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Mac/Linux
# or: venv\Scripts\activate       # Windows

# Install Python packages
pip install -r requirements.txt
```

### 3. Frontend setup
```bash
cd currhub_project/frontend
npm install
```

---

## Running the App

Open **two terminals**:

**Terminal 1 — Ollama AI server:**
```bash
ollama serve
# Stays at http://localhost:11434
```

**Terminal 2 — Flask backend:**
```bash
cd currhub_project/backend
source venv/bin/activate
python app.py
# Runs at http://localhost:5000
```

**Terminal 3 — React frontend:**
```bash
cd currhub_project/frontend
npm start
# Opens http://localhost:3000 automatically
```

---

## What Was Fixed (vs old version)

| Issue | Fix |
|-------|-----|
| **Chatbot not working** | Switched from `/api/generate` to `/api/chat` (Ollama's multi-turn chat endpoint). Added proper system message with curriculum context. Supports SSE streaming tokens. |
| **Visual map broken** | Complete D3.js rewrite using React `useRef`. Nodes pinned to semester lanes with `forceX`. `assign_prerequisites()` post-processor guarantees arrows even when AI doesn't generate prereqs. Hover tooltip shows course details. |
| **Hindi/Telugu not working** | `LANG_SYSTEM` dict with full Devanagari and Telugu script examples injected directly into the prompt. Fallback also generates Hindi/Telugu labels. |
| **Any course support** | Skill field is free text. Fallback generates 8-phase generic structure for unknown subjects. |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-curriculum` | Generate curriculum |
| POST | `/api/chat-refine` | Chat with AI (streaming SSE or JSON) |
| POST | `/api/export` | Export as pdf/excel/docx/csv/markdown/json |
| GET  | `/health` | Check Ollama + model status |

### Chat endpoint — streaming mode
```js
const res = await fetch('/api/chat-refine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    curriculum: currentCurriculum,
    message: "Add more practical projects",
    history: [],          // prior [{role, content}] turns
    stream: false,        // set true for SSE token streaming
  })
});
const data = await res.json();
// data.response — the AI reply
```

---

## Features

- ⚡ Generate semester-wise curricula for **any subject** — free text input
- 🌐 **Multilingual** — Telugu, Hindi, English with proper script output
- 🏫 **College** or **Self-Study** curriculum modes
- 💬 **Working chatbot** — multi-turn AI conversation to refine curriculum
- 🗺️ **Working D3.js visual map** — interactive prerequisites graph with drag
- 📦 **6 export formats** — PDF, DOCX, Excel, CSV, Markdown, JSON
- 📚 **Free resources** — YouTube, open-source, certifications (self-study mode)
- ⚖️ **Compare mode** — side-by-side curriculum comparison
- 100% local — **zero cloud, zero API cost, zero data leaks**
