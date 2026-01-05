/**
 * Kvizovka Server
 *
 * Main entry point for the Hono server with Socket.io integration.
 */

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

const app = new Hono()

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API info endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Kvizovka Server',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      socket: 'Socket.io connection available'
    }
  })
})

// Start server with Socket.io integration
const port = Number(process.env.PORT) || 3000

const server = serve({
  fetch: app.fetch,
  port,
  createServer
}, (info) => {
  console.log(`🚀 Kvizovka server running on http://localhost:${info.port}`)
  console.log(`🔌 Socket.io ready for connections`)
})

// Setup Socket.io on the HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

export { app, io, server }
