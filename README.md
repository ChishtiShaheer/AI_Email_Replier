# AI Email Reply Assistant

Paste or upload an email, pick a tone, get back a sentiment read, a
subject-line suggestion, and two ready-to-send reply drafts you can still
edit before copying.

- **Backend:** Python + FastAPI + Groq (free API, Llama 3.3 70B)
- **Frontend:** Next.js + TypeScript + Tailwind v4

---

## Quick start

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows PowerShell
# source .venv/bin/activate       # macOS/Linux

pip install -r requirements.txt
cp .env.example .env
```

Open `.env` and add your free Groq key:
```
GROQ_API_KEY=your_key_here
```
Get one at [console.groq.com/keys](https://console.groq.com/keys) — no credit card needed.

```bash
uvicorn main:app --reload --port 8000
```

Runs at `http://localhost:8000`. Interactive API docs (auto-generated) at
`http://localhost:8000/docs` — useful for testing the endpoint directly
before wiring up the frontend.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Runs at `http://localhost:3000`.

Open it, paste an email, pick a tone, hit **Generate reply**.

---

## Architecture

```
Next.js UI (paste/upload + tone)
        │  multipart/form-data
        ▼
FastAPI  /api/generate-reply
        │  builds prompt, calls Groq
        ▼
Groq API (Llama 3.3 70B) — returns structured JSON
        │
        ▼
FastAPI validates with Pydantic → JSON response
        │
        ▼
Next.js renders sentiment, subject, editable reply drafts
```

---

## Project structure

```
backend/
  main.py             app setup, CORS, the /api/generate-reply route, file parsing
  models.py           Pydantic request/response schemas
  groq_service.py      prompt construction + Groq API call + JSON parsing
  requirements.txt
  .env.example          → copy to .env, add your Groq key

frontend/
  app/page.tsx          main UI: paste/upload toggle, tone picker, submit
  app/layout.tsx         fonts + metadata
  app/globals.css        Tailwind v4 theme tokens + postmark badge styles
  components/
    ToneSelector.tsx
    ReplyCard.tsx
  lib/api.ts             fetch wrapper to the backend
  .env.local.example    → copy to .env.local
```

---

## API reference

`POST /api/generate-reply` — `multipart/form-data`

| Field        | Type   | Required          | Notes                                   |
|--------------|--------|-------------------|-------------------------------------------|
| `tone`       | string | yes               | one of: `professional`, `friendly`, `formal`, `concise` |
| `email_text` | string | one of these two  | pasted email content                     |
| `file`       | file   | one of these two  | `.txt` or `.eml` upload                  |

Response:
```json
{
  "sentiment": "frustrated",
  "summary": "Customer is reporting a delayed shipment.",
  "subject_suggestion": "Re: Update on your order",
  "replies": ["...", "..."]
}
```

---

## Why Groq

Groq's API is free (rate-limited, no credit card), OpenAI-compatible, and
serves fast open models like Llama 3.3 70B — plenty capable for email
drafting at $0 cost, which matters for a student prototype. To swap
providers later, only `backend/groq_service.py` needs to change.

---

## Troubleshooting

- **`ModuleNotFoundError`** — the venv isn't active or `pip install -r requirements.txt`
  didn't run inside it. Confirm your terminal prompt shows `(.venv)` before
  installing or running anything.
- **`GroqError: api_key client option must be set`** — check `backend/.env`
  exists (not `.env.txt` — Windows sometimes hides extensions), contains
  `GROQ_API_KEY=...`, and restart `uvicorn` after any change (env vars only
  load once at startup).
- **No styling on the frontend** — confirm `app/globals.css` starts with
  `@import "tailwindcss";` (Tailwind v4 syntax), not the old
  `@tailwind base/components/utilities` (v3 syntax).
- **Stuck/orphaned dev servers in Task Manager** — stop sessions with the
  Run & Debug panel's stop button rather than closing the window. If one
  gets stuck anyway:
  ```powershell
  Get-NetTCPConnection -LocalPort 8000,3000 -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force }
  ```
- **`.env` accidentally committed to git** — rotate the key immediately at
  console.groq.com/keys, then remove it from git history
  (`git rm --cached backend/.env`, amend/commit, verify with
  `git ls-files | Select-String ".env"` before pushing again).
