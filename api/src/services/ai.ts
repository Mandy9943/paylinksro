import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function generateSimpleAiText(prompt: string) {
  // Enforce plain-text only output (no Markdown, no code fences, no emojis)
  const instruction =
    "Return only plain text. Do not use Markdown, bullet points, code fences, quotes, emojis, or formatting. Keep it concise.";

  const { text } = await generateText({
    model: google("gemini-2.0-flash-lite"),
    prompt: `${instruction}\n\n${prompt}`,
  });

  // Best-effort sanitation if the model still adds formatting
  const sanitized = (text || "")
    // remove code fences/backticks
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`+/g, "")
    // strip common markdown emphasis
    .replace(/[*_#>~\-]+/g, (m) => (m.trim() === "-" ? "-" : ""))
    // strip leading/trailing quotes
    .replace(/^\s*["'“”‘’]/, "")
    .replace(/["'“”‘’]\s*$/, "")
    .trim();

  return sanitized;
}
