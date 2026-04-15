import { Hono } from 'hono'
import { HazelPersonality } from '@proj-hazel/core'

const app = new Hono()

app.post('/api/chat', async (c) => {
  const { userId, message } = await c.req.json()

  try {
    // Load user profile
    const user = await db.users.findById(userId)
    
    // Get AI response
    const personality = new HazelPersonality(llmProvider)
    const response = await personality.generateResponse(message)

    // Save conversation
    await db.conversations.create({
      userId,
      userMessage: message,
      aiResponse: response,
      timestamp: new Date()
    })

    return c.json({ response })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.ws('/api/voice-chat', (ws) => {
  ws.onmessage = async (event) => {
    const { type, data } = JSON.parse(event.data)

    if (type === 'audio') {
      // Process audio chunk
      const transcription = await transcribeAudio(data)
      const response = await generateResponse(transcription)
      
      // Send TTS audio back
      const audioData = await synthesizeSpeech(response)
      ws.send(JSON.stringify({ type: 'audio', data: audioData }))
    }
  }
})

export default app
