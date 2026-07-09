export type Tone = "professional" | "friendly" | "formal" | "concise";

export interface GenerateReplyResponse {
  sentiment: string;
  summary: string;
  subject_suggestion: string;
  replies: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface GenerateReplyParams {
  tone: Tone;
  emailText?: string;
  file?: File;
}

export async function generateReply({
  tone,
  emailText,
  file,
}: GenerateReplyParams): Promise<GenerateReplyResponse> {
  const formData = new FormData();
  formData.append("tone", tone);

  if (file) {
    formData.append("file", file);
  } else if (emailText) {
    formData.append("email_text", emailText);
  }

  const res = await fetch(`${API_URL}/api/generate-reply`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.detail ?? `Request failed with status ${res.status}`);
  }

  return res.json();
}