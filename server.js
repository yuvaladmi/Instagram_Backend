import http from 'http'
import path from 'path'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'
import { storyRoutes } from './api/story/story.routes.js'
import { setupSocketAPI } from './services/socket.service.js'

import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

const app = express()
const server = http.createServer(app)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            'http://127.0.0.1:5174',
            'http://localhost:5174'
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}
// Express App Config
app.use(cookieParser())
app.use(express.json())



app.all('/*all', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/story', storyRoutes)
app.use((req, res, next) => {
    console.log('📡 Incoming request:', req.method, req.url)
    next()
  })
setupSocketAPI(server)

app.get('/secret', (req, res) => {
    if (process.env.SECRET_STR) {
        res.send(process.env.SECRET_STR)
    } else {
        res.send('No secret string attached')
    }
})

// Make every unhandled server-side-route match index.html
// so when requesting http://localhost:3030/unhandled-route... 
// it will still serve the index.html file
// and allow vue/react-router to take it from there

// app.get('/**', (req, res) => {
// app.get('/*all', (req, res) => {
//     res.sendFile(path.resolve('public/index.html'))
// })

import { logger } from './services/logger.service.js'
const port = process.env.PORT || 3030

server.listen(port, () => {
    logger.info('Server is running on: ' + `http://localhost:${port}/`)
})