import express from 'express'

import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'

import { getUser, getUsers, deleteUser, updateUser, followUser, unFollowUser, saveStory } from './user.controller.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/:id', requireAuth, updateUser)
router.post('/:id/follow', requireAuth, followUser)
router.post('/:id/unfollow', requireAuth, unFollowUser)
router.post('/:id/savestory', requireAuth, saveStory)
router.delete('/:id', requireAuth, requireAdmin, deleteUser)

export const userRoutes = router