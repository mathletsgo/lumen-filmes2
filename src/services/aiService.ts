import { createServerFn } from "@tanstack/react-start";
import OpenAI from "openai";

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      messages: { role: "user" | "assistant" | "system"; content: string }[];
      context?: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    try {
      // Chave lida exclusivamente no servidor — nunca exposta ao browser
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        console.error("ERRO: OPENAI_API_KEY não foi encontrada.");
        return { success: false, error: "Chave da API ausente." };
      }

      const openai = new OpenAI({ apiKey });

      const systemPrompt = `Você é um assistente de filmes e séries dentro de um site de streaming.
Você pode operar em dois modos:

🎬 MODO 1: GERAL (sem filme selecionado)
Quando não houver filme no contexto:
- Recomende filmes e séries
- Sugira por gênero, humor ou estilo
- Dê listas curtas e diretas

🎥 MODO 2: FILME SELECIONADO (COM CONTEXTO)
Quando existir um filme atual, use as informações abaixo:
Filme atual: ${data.context || "Nenhum"}

Nesse modo você deve:
- Falar sobre esse filme específico
- Explicar sinopse de forma simples
- Dar opiniões e curiosidades
- Sugerir filmes parecidos
- Responder dúvidas sobre o filme

⚡ REGRAS:
- Seja direto e natural
- Respostas curtas e úteis
- Nada de textos longos
- Se possível use listas e emojis 🎬🍿🔥
- Nunca inventar dados fora do contexto`;

      const messages = [{ role: "system", content: systemPrompt }, ...data.messages] as any;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return {
        success: true,
        message: completion.choices[0].message,
      };
    } catch (error: any) {
      console.error("OpenAI Error:", error);
      return {
        success: false,
        error: "Ocorreu um erro ao processar sua requisição.",
      };
    }
  });

export const analyzeSearchQuery = createServerFn({ method: "POST" })
  .inputValidator((data: { query: string }) => data)
  .handler(async ({ data }) => {
    try {
      // Chave lida exclusivamente no servidor — nunca exposta ao browser
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return { success: false, correctedQuery: null, isCorrection: false };
      }

      const openai = new OpenAI({ apiKey });

      const systemPrompt = `Você é um motor de busca inteligente de um site de filmes.
O usuário vai digitar uma intenção de busca que pode conter erros de digitação, nomes parciais ou descrições (ex: "filme do carro do tempo", "vngadorez").
Sua tarefa é retornar APENAS um objeto JSON no formato:
{ "correctedQuery": "Nome Oficial do Filme", "isCorrection": true }

Se a busca já estiver perfeita ou se você não conseguir deduzir qual filme é, retorne:
{ "correctedQuery": "A busca original", "isCorrection": false }

Lembre-se: Responda APENAS com o JSON válido, sem markdown (\`\`\`json) ou texto adicional.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Busca do usuário: "${data.query}"` },
        ],
        temperature: 0.2,
        max_tokens: 100,
        response_format: { type: "json_object" },
      });

      const responseText = completion.choices[0].message.content || "{}";
      const result = JSON.parse(responseText);

      return {
        success: true,
        correctedQuery: result.correctedQuery,
        isCorrection: result.isCorrection,
      };
    } catch (error) {
      console.error("AI Search Error:", error);
      return { success: false, correctedQuery: null, isCorrection: false };
    }
  });
