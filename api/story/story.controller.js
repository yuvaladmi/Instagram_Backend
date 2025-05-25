import { logger } from '../../services/logger.service.js'
import { storyService } from './story.service.js'

export async function getStories(req, res) {
    try {
        // const filterBy = {
        //     txt: req.query.txt || '',
        //     minSpeed: +req.query.minSpeed || 0,
        //     sortField: req.query.sortField || '',
        //     sortDir: req.query.sortDir || 1,
        //     pageIdx: req.query.pageIdx,
        // }
        const stories = await storyService.query()//filterBy
        res.json(stories)
    } catch (err) {
        logger.error('Failed to get stories', err)
        res.status(400).send({ err: 'Failed to get stories' })
    }
}

export async function getStoryById(req, res) {
    try {
        const storyId = req.params.id
        const story = await storyService.getById(storyId)
        res.json(story)
    } catch (err) {
        logger.error('Failed to get story', err)
        res.status(400).send({ err: 'Failed to get story' })
    }
}

export async function addStory(req, res) {
    const { loggedinUser, body: story } = req
    logger.info('story', story);
    try {
        story.story.by = loggedinUser
        story.story.comments = [];
        story.story.likedBy = [];
        const addedStory = await storyService.add(story.story)
        res.json(addedStory)
    } catch (err) {
        logger.error('Failed to add story', err)
        res.status(400).send({ err: 'Failed to add story' })
    }
}

// export async function updateStory(req, res) {
//     const { loggedinUser, body: story } = req
//     const { _id: userId, isAdmin } = loggedinUser

//     if (!isAdmin && story.owner._id !== userId) {
//         res.status(403).send('Not your story...')
//         return
//     }

//     try {
//         const updatedStory = await storyService.update(story)
//         res.json(updatedStory)
//     } catch (err) {
//         logger.error('Failed to update story', err)
//         res.status(400).send({ err: 'Failed to update story' })
//     }
// }

export async function removeStory(req, res) {
    try {
        const storyId = req.params.id
        const removedId = await storyService.remove(storyId)

        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove story', err)
        res.status(400).send({ err: 'Failed to remove story' })
    }
}

export async function addStoryMsg(req, res) {
    const { loggedinUser } = req

    try {
        const storyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
        }
        const savedMsg = await storyService.addStoryMsg(storyId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to add story msg', err)
        res.status(400).send({ err: 'Failed to add story msg' })
    }
}

export async function addStoryLike(req, res) {
    console.log('addStoryLike')
    const { loggedinUser } = req
    try {
        console.log(loggedinUser)
        const storyId = req.params.id
        console.log(storyId)
        const savedLike = await storyService.addStoryLike(storyId, loggedinUser)
        res.json(savedLike)
    } catch (err) {
        logger.error('Failed to add story msg', err)
        res.status(400).send({ err: 'Failed to add story msg' })
    }
}

export async function getUserPosts(req, res) {
    try {
        const userId = req.params.userId
        logger.info('userId=>'+userId);
        const userPosts = await storyService.getUserPosts(userId)
        console.log('userPosts=>'+userPosts);
        res.json(userPosts)
    } catch (err) {
        logger.error('Failed to get users stories ', err)
        res.status(400).send({ err: 'Failed to get users stories' })
    }
}

export async function removeStoryMsg(req, res) {
    try {
        const { id: storyId, msgId } = req.params

        const removedId = await storyService.removeStoryMsg(storyId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove story msg', err)
        res.status(400).send({ err: 'Failed to remove story msg' })
    }
}
