import { integer, text, timestamp, pgTable, uuid, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  preferences: jsonb('preferences'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  userMessage: text('user_message').notNull(),
  aiResponse: text('ai_response').notNull(),
  sentiment: text('sentiment'),
  createdAt: timestamp('created_at').defaultNow()
})

export const memories = pgTable('memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  type: text('type'), // 'personal' | 'preference' | 'event'
  content: text('content').notNull(),
  importance: integer('importance'),
  embedding: jsonb('embedding'), // Vector for semantic search
  createdAt: timestamp('created_at').defaultNow()
})

export const voiceSettings = pgTable('voice_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  voiceProvider: text('voice_provider'), // 'elevenlabs', 'google', etc.
  voiceId: text('voice_id'),
  speed: integer('speed').default(1),
  pitch: integer('pitch').default(1)
})
