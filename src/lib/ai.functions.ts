import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const SYSTEM_PROMPT = `You are the Student Wallet AI — a friendly, practical, empathetic finance coach for college students.
Your goals:
- Help the student track spending, save money, stick to budgets, and reach savings goals.
- Give concise, actionable advice in bullet points. Prefer numbered lists.
- Use the student's currency and reference their real numbers when provided.
- Be warm, encouraging, and non-judgmental. Never shame the student.
- If asked about non-finance topics, gently redirect to money/budgeting.`;

const ChatInput = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })).min(1),
  context: z.string().optional(),
});

export const aiChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3.5-flash");
    const system = data.context
      ? `${SYSTEM_PROMPT}\n\n---\nStudent's live financial context:\n${data.context}`
      : SYSTEM_PROMPT;
    const { text } = await generateText({
      model,
      system,
      messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return { text };
  });

const InsightsInput = z.object({
  context: z.string().min(1),
});

export const aiInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InsightsInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3.5-flash");
    const { text } = await generateText({
      model,
      system: "You produce short, punchy financial tips (max 2 sentences) for a student. Be specific and reference numbers. No preamble.",
      prompt: `Given this data, give ONE actionable suggestion:\n${data.context}`,
    });
    return { suggestion: text.trim() };
  });

const ReceiptInput = z.object({
  imageBase64: z.string().min(20),
  mimeType: z.string().default("image/jpeg"),
});

export const aiReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReceiptInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    // Direct fetch to gateway since AI SDK converters don't easily inline images
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          {
            role: "system",
            content: 'You extract expense info from receipts. Return ONLY a compact JSON object: {"title": string, "amount": number, "category": one of ["Food","Hostel","Rent","Transport","Petrol","Books","Stationery","Shopping","Entertainment","College Fee","Internet","Recharge","Medical","Emergency","Others"], "date": YYYY-MM-DD or null, "description": string}. No prose, no code fences.',
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract expense details from this receipt." },
              { type: "image_url", image_url: { url: `data:${data.mimeType};base64,${data.imageBase64}` } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${errText.slice(0, 200)}`);
    }
    const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    // Strip possible code fences
    const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return { data: parsed as { title?: string; amount?: number; category?: string; date?: string | null; description?: string } };
    } catch {
      return { data: {}, raw: content };
    }
  });
