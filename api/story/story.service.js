import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

const PAGE_SIZE = 3

export const storyService = {
    remove,
    query,
    getById,
    add,
    update,
    addStoryMsg,
    removeStoryMsg,
    addStoryLike
}

async function query() {//filterBy = { txt: '' }
    try {
        // const criteria = _buildCriteria(filterBy)
        // const sort = _buildSort(filterBy)

        const collection = await dbService.getCollection('story')
        var storyCursor = await collection.find()//criteria, { sort }

        // if (filterBy.pageIdx !== undefined) {
        //     storyCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
        // }

        const stories = storyCursor.toArray()
        return stories
    } catch (err) {
        logger.error('cannot find stories', err)
        throw err
    }
}

async function getById(storyId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(storyId) }

        const collection = await dbService.getCollection('story')
        const story = await collection.findOne(criteria)

        story.createdAt = story._id.getTimestamp()
        return story
    } catch (err) {
        logger.error(`while finding story ${storyId}`, err)
        throw err
    }
}

async function remove(storyId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: ownerId, isAdmin } = loggedinUser

    try {
        const criteria = {
            _id: ObjectId.createFromHexString(storyId),
        }

        if (!isAdmin) criteria['owner._id'] = ownerId

        const collection = await dbService.getCollection('story')
        const res = await collection.deleteOne(criteria)

        if (res.deletedCount === 0) throw ('Not your story')
        return storyId
    } catch (err) {
        logger.error(`cannot remove story ${storyId}`, err)
        throw err
    }
}

async function add(story) {
    try {
        const collection = await dbService.getCollection('story')
        await collection.insertOne(story)

        return story
    } catch (err) {
        logger.error('cannot insert story', err)
        throw err
    }
}

async function update(story) {
    const storyToSave = { vendor: story.vendor, speed: story.speed }

    try {
        const criteria = { _id: ObjectId.createFromHexString(story._id) }
        const collection = await dbService.getCollection('story')
        await collection.updateOne(criteria, { $set: storyToSave })

        return story
    } catch (err) {
        logger.error(`cannot update story ${story._id}`, err)
        throw err
    }
}

async function addStoryMsg(storyId, msg) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(storyId) }
        msg.id = makeId()

        const collection = await dbService.getCollection('story')
        await collection.updateOne(criteria, { $push: { comments: msg } })

        return msg
    } catch (err) {
        logger.error(`cannot add story msg ${storyId}`, err)
        throw err
    }
}

async function addStoryLike(storyId, user) {
    const criteria = { _id: ObjectId.createFromHexString(storyId) }
    const collection = await dbService.getCollection('story')
    const story = await collection.findOne(criteria)
    if (!story) throw new Error('Story not found')

    const alreadyLiked = story.likedBy?.some(u => u._id === user._id)

    const updatedLikedBy = alreadyLiked
        ? story.likedBy.filter(u => u._id !== user._id)
        : [...(story.likedBy || []), {
            _id: user._id,
            fullname: user.fullname,
            imgUrl: user.imgUrl
        }]

    await collection.updateOne(
        criteria,
        { $set: { likedBy: updatedLikedBy } }
    )

    return { likedBy: updatedLikedBy }
}



async function removeStoryMsg(storyId, msgId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(storyId) }

        const collection = await dbService.getCollection('story')
        await collection.updateOne(criteria, { $pull: { msgs: { id: msgId } } })

        return msgId
    } catch (err) {
        logger.error(`cannot remove story msg ${storyId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {
        vendor: { $regex: filterBy.txt, $options: 'i' },
        speed: { $gte: filterBy.minSpeed },
    }

    return criteria
}

function _buildSort(filterBy) {
    if (!filterBy.sortField) return {}
    return { [filterBy.sortField]: filterBy.sortDir }
}