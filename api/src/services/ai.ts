import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function generateSimpleAiText(prompt: string) {
  const { text } = await generateText({
    model: google("gemini-2.0-flash-lite"),
    prompt: prompt,
  });

  return text;
}
