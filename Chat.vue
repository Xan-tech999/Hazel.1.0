<template>
  <div class="chat-page">
    <div class="chat-container">
      <!-- Character -->
      <CharacterDisplay ref="character" />

      <!-- Chat History -->
      <div class="chat-history">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message', msg.role]"
        >
          <div class="message-content">{{ msg.content }}</div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <!-- Text Input -->
        <input
          v-model="inputText"
          type="text"
          placeholder="Chat with Hazel..."
          @keyup.enter="sendMessage"
          class="text-input"
        />

        <!-- Voice Input Button -->
        <button
          :class="['voice-button', { recording }]"
          @click="toggleVoiceRecording"
          title="Click to talk"
        >
          🎤
        </button>

        <!-- Send Button -->
        <button @click="sendMessage" class="send-button">
          ➤
        </button>
      </div>

      <!-- Emotional Connection Stats -->
      <div class="connection-stats">
        <div class="stat">
          <span>Bond:</span>
          <div class="progress-bar">
            <div :style="{ width: bondLevel + '%' }"></div>
          </div>
        </div>
        <div class="stat">
          <span>Understanding:</span>
          <div class="progress-bar">
            <div :style="{ width: understandingLevel + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import CharacterDisplay from '@proj-hazel/ui'
import { HazelAPI } from '@/api'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

const character = ref()
const messages = reactive<Message[]>([])
const inputText = ref('')
const recording = ref(false)
const bondLevel = ref(0)
const understandingLevel = ref(0)

const api = new HazelAPI()

onMounted(async () => {
  // Load conversation history
  const history = await api.getChatHistory()
  messages.push(...history)

  // Initial greeting
  const greeting = await api.chat('Hi Hazel!')
  messages.push({
    id: crypto.randomUUID(),
    role: 'ai',
    content: greeting,
    timestamp: new Date()
  })
  character.value?.setMessage(greeting)
})

async function sendMessage(): Promise<void> {
  if (!inputText.value.trim()) return

  // Add user message
  const userMsg: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    content: inputText.value,
    timestamp: new Date()
  }
  messages.push(userMsg)

  // Get AI response
  const response = await api.chat(inputText.value)
  messages.push({
    id: crypto.randomUUID(),
    role: 'ai',
    content: response,
    timestamp: new Date()
  })

  character.value?.setMessage(response)
  
  // Play voice response
  await api.speak(response)

  // Update bond level
  bondLevel.value = Math.min(100, bondLevel.value + 2)

  inputText.value = ''
}

async function toggleVoiceRecording(): Promise<void> {
  recording.value = !recording.value

  if (recording.value) {
    const transcript = await api.recordAudio()
    inputText.value = transcript
    await sendMessage()
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.chat-page {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-container {
  width: 90%;
  max-width: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  height: 90vh;
  overflow: hidden;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  flex-direction: column;
  
  &.user {
    align-items: flex-end;
  }
  
  &.ai {
    align-items: flex-start;
  }
}

.message-content {
  padding: 12px 16px;
  border-radius: 15px;
  max-width: 70%;
  background: #f0f0f0;
  
  .user & {
    background: #667eea;
    color: white;
  }
}

.message-time {
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
}

.input-area {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #eee;
}

.text-input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 25px;
  padding: 12px 16px;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

.voice-button, .send-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #667eea;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.recording {
    background: #ff6b6b;
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.connection-stats {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  font-size: 0.875rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  overflow: hidden;
  
  div {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
  }
}
</style>
