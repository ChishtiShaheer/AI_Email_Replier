"""
AI Email Reply Assistant — FastAPI backend.

Run locally:
    uvicorn main:app --reload
"""

import os
from email import message_from_bytes
from email.policy import default as email_default_policy
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from groq_service import generate_email_reply
from models import GenerateReplyResponse, Tone

load_dotenv()

app = FastAPI(title="AI Email Reply Assistant", version="1.0.0")

# --- CORS ---------------------------------------------------------------
# Comma-separated list of allowed frontend origins, e.g.
# ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    """Simple liveness check + confirms the API is reachable from the frontend."""
    return {"status": "ok", "service": "AI Email Reply Assistant"}


def _extract_text_from_eml(raw_bytes: bytes) -> str:
    """Pull the plain-text body out of a raw .eml file."""
    msg = message_from_bytes(raw_bytes, policy=email_default_policy)
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                return part.get_content()
        return ""
    return msg.get_content()


@app.post("/api/generate-reply", response_model=GenerateReplyResponse)
async def generate_reply(
    tone: Tone = Form(...),
    email_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    """
    Accepts EITHER pasted email text OR an uploaded file (.txt or .eml),
    plus a desired reply tone, and returns AI-generated reply suggestions.
    """
    if not email_text and not file:
        raise HTTPException(
            status_code=400,
            detail="Provide either pasted email text or an uploaded file.",
        )

    if file:
        raw_bytes = await file.read()
        if file.filename and file.filename.lower().endswith(".eml"):
            try:
                content = _extract_text_from_eml(raw_bytes)
            except Exception as exc:
                raise HTTPException(status_code=400, detail=f"Could not parse .eml file: {exc}")
        else:
            try:
                content = raw_bytes.decode("utf-8")
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded file must be UTF-8 text or a valid .eml file.",
                )
    else:
        content = email_text or ""

    content = content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="No email content found to process.")

    try:
        result = generate_email_reply(content, tone.value)
    except ValueError as exc:
        # Model returned something we couldn't parse as JSON
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Groq API error: {exc}")

    return GenerateReplyResponse(**result)