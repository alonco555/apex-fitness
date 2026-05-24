import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 500 })
  }

  try {
    const { imageBase64, mimeType } = await request.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: imageBase64 },
          },
          {
            type: 'text',
            text: 'Analyze this meal photo and estimate the nutritional content of each visible food item. Return ONLY valid JSON, no explanation, in this exact format: {"foods":[{"name":"string","grams":number,"cal":number,"p":number,"c":number,"f":number}],"total":{"cal":number,"p":number,"c":number,"f":number}}. Use realistic portion sizes. All numbers must be integers.',
          },
        ],
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/)
    const jsonStr   = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : null

    if (!jsonStr) return NextResponse.json({ error: 'Could not parse AI response.' }, { status: 500 })

    return NextResponse.json(JSON.parse(jsonStr))
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
