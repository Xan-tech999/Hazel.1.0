<template>
  <div class="character-container">
    <div class="character-frame">
      <!-- Hazel Character Animation -->
      <canvas ref="canvas" class="character-canvas"></canvas>
      
      <!-- Blinking eyes & expressions -->
      <div class="character-overlay" :style="emotionStyle">
        <div class="eyes">
          <div class="eye left" :style="eyePosition"></div>
          <div class="eye right" :style="eyePosition"></div>
        </div>
      </div>
    </div>

    <!-- Chat bubble -->
    <transition name="bubble-fade">
      <div v-if="currentMessage" class="chat-bubble">
        {{ currentMessage }}
      </div>
    </transition>

    <!-- Character status -->
    <div class="character-status">
      <span :class="['indicator', connectionState]"></span>
      {{ statusText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { HAZEL_CHARACTER_IMAGE } from '@proj-hazel/shared'

const canvas = ref<HTMLCanvasElement>()
const currentMessage = ref<string>('')
const emotionalState = ref<string>('neutral')
const eyePosition = ref({ transform: 'translate(0, 0)' })

const emotionStyle = computed(() => ({
  opacity: emotionalState.value === 'happy' ? 0.95 : 0.85
}))

const statusText = computed(() => {
  return `Hazel is ${emotionalState.value}`
})

onMounted(async () => {
  // Initialize character canvas with your image
  const ctx = canvas.value?.getContext('2d')
  if (ctx) {
    const img = new Image()
    img.src = HAZEL_CHARACTER_IMAGE
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.value!.width, canvas.value!.height)
    }
  }

  // Setup animation loop for eye tracking
  animateCharacter()
})

function animateCharacter(): void {
  setInterval(() => {
    // Update eye position to follow mouse or random movement
    eyePosition.value = {
      transform: `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`
    }
  }, 2000)
}

function setMessage(message: string): void {
  currentMessage.value = message
  setTimeout(() => {
    currentMessage.value = ''
  }, 3000)
}

defineExpose({ setMessage, emotionalState })
</script>

<style scoped>
.character-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.character-frame {
  position: relative;
  width: 300px;
  height: 400px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.character-canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.character-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
}

.eyes {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 40px;
}

.eye {
  width: 20px;
  height: 20px;
  background: #00d4ff;
  border-radius: 50%;
  transition: transform 0.1s ease;
}

.chat-bubble {
  background: white;
  border-radius: 15px;
  padding: 12px 16px;
  max-width: 250px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: bubble-pop 0.3s ease;
}

.bubble-fade-enter-active, .bubble-fade-leave-active {
  transition: opacity 0.3s ease;
}

.bubble-fade-enter-from, .bubble-fade-leave-to {
  opacity: 0;
}

.character-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #666;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff0000;
  
  &.online {
    background: #00ff00;
  }
}
</style>
