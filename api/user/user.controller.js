import { userService } from './user.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        res.send(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(400).send({ err: 'Failed to get user' })
    }
}

export async function getUsers(req, res) {
    try {
        const filterBy = {
            txt: req.query?.txt || '',
            minBalance: +req.query?.minBalance || 0
        }
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(400).send({ err: 'Failed to get users' })
    }
}

export async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete user', err)
        res.status(400).send({ err: 'Failed to delete user' })
    }
}

export async function updateUser(req, res) {
    try {
        const user = req.body
        const savedUser = await userService.update(user)
        res.send(savedUser)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(400).send({ err: 'Failed to update user' })
    }
}

// controller
export async function followUser(req, res) {
    const { id } = req.params
    const { loggedinUser } = req
    console.log(id)
    console.log(loggedinUser)
    try {
        await userService.followUser(id, loggedinUser._id)
        const updatedUser = await userService.getById(loggedinUser._id)
        // console.log(updatedUser)
        res.json(updatedUser)
    } catch (err) {
        res.status(500).send('Failed to follow')
    }
}

export async function unFollowUser(req, res) {
    const { id } = req.params
    const { loggedinUser } = req

    try {
        await userService.unFollowUser(id, loggedinUser._id)
        // const updatedUser = await userService.getById(loggedinUser._id)
        res.json(loggedinUser)
    } catch (err) {
        res.status(500).send('Failed to unfollow')
    }
}

export async function saveStory(req, res){
    const { id } = req.params
    const { loggedinUser } = req
    
    try {
        await userService.toggleSaveStory(id, loggedinUser._id)
        const updatedUser = await userService.getById(loggedinUser._id)
        res.json(updatedUser)
    } catch (err) {
        res.status(500).send('failed saveStory')
    }
}

