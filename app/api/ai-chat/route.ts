import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Du bist ein erfahrener Wein-Berater für die Altdeutsche Weinstube, spezialisiert auf deutsche Weine. 
          Deine Expertise umfasst:
          - Mosel Riesling: Elegante, mineralische Weißweine mit fruchtiger Säure
          - Rheingau Spätburgunder: Kräftige, vollmundige Rotweine mit Eleganz
          - Pfalz Grauburgunder: Frische, aromatische Weißweine mit Körper
          
          Gib kompetente, persönliche Empfehlungen und erkläre die Besonderheiten der Weine.
          Sei freundlich, professionell und hilfsbereit. Antworte auf Deutsch.`,
        },
        ...messages,
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 
      "Entschuldigung, ich konnte keine Antwort generieren.";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process chat request",
        message: "Entschuldigung, der Wein-Berater ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut."
      },
      { status: 500 }
    );
  }
}
