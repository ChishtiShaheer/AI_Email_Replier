from enum import Enum
from typing import List

from pydantic import BaseModel


class Tone(str, Enum):
    professional = "professional"
    friendly = "friendly"
    formal = "formal"
    concise = "concise"


class GenerateReplyResponse(BaseModel):
    sentiment: str
    summary: str
    subject_suggestion: str
    replies: List[str]