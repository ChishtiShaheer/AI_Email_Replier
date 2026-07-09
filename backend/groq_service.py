"""
Wraps calls to Groq's free, OpenAI-compatible chat completions API.

Groq gives free API access (with rate limits) to fast open models like
Llama 3.3 70B — plenty capable for email-reply generation, and $0 cost
for a prototype. Get a key at https://console.groq.com/keys
"""

import json
import os

from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

SYSTEM_PROMPT = """You are an expert email-reply assistant used across industries \
(customer support, sales, HR, education, legal services, general business).

Given an email someone received, you:
1. Detect the sender's overall sentiment (one or two words, e.g. "frustrated", \
"neutral", "enthusiastic").
2. Write a one-sentence plain-language summary of what the email is about.
3. Suggest a short, appropriate subject line for the reply.
4. Write TWO distinct reply suggestions in the requested tone — same intent, \
different phrasing — each grammatically flawless, clear, and ready to send \
with minimal editing.

You always respond with ONLY a single valid JSON object, no markdown code \
fences, no commentary before or after it, in exactly this shape:
{
  "sentiment": "...",
  "summary": "...",
  "subject_suggestion": "...",
  "replies": ["reply variant one", "reply variant two"]
}
"""


def _build_user_prompt(email_text: str, tone: str) -> str:
    return f"""Requested reply tone: {tone}

ORIGINAL EMAIL:
\"\"\"
{email_text}
\"\"\"

Return the JSON object described in your instructions, using the tone above \
for both reply variants."""


def _parse_json_response(raw: str) -> dict:
    text = raw.strip()
    if text.startswith("```"):
        text = text.strip("`").strip()
        if text.lower().startswith("json"):
            text = text[4:].strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Model did not return valid JSON: {exc}\nRaw response: {raw}")


def generate_email_reply(email_text: str, tone: str) -> dict:
    """Calls Groq and returns a dict matching GenerateReplyResponse's shape."""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": _build_user_prompt(email_text, tone)},
    ]

    try:
        # Ask for strict JSON mode where the model supports it.
        completion = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.6,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )
    except Exception:
        # Fallback if the model/account doesn't support response_format.
        completion = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.6,
            max_tokens=1024,
        )

    raw = completion.choices[0].message.content
    return _parse_json_response(raw)