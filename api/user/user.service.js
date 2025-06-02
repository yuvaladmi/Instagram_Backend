import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { reviewService } from '../review/review.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
    add, // Create (Signup)
    getById, // Read (Profile page)
    update, // Update (Edit profile)
    remove, // Delete (remove user)
    query, // List (of users)
    getByUsername, // Used for Login
    followUser,
    unFollowUser,
    toggleSaveStory
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        var criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        delete user.password

        criteria = { byUserId: userId }

        user.givenReviews = await reviewService.query(criteria)
        user.givenReviews = user.givenReviews.map(review => {
            delete review.byUser
            return review
        })

        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable properties
        const userToSave = {
            _id: ObjectId.createFromHexString(user._id), // needed for the returnd obj
            fullname: user.fullname,
            score: user.score,
        }
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            imgUrl: user.imgUrl,
            isAdmin: user.isAdmin,
            bio: '',
            following: [],
            followers: [],
            savedStoryIds: []
        }
        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

// service
async function followUser(targetUserId, currentUserId) {
  const userCollection = await dbService.getCollection('user')
  await userCollection.updateOne(
    { _id: ObjectId.createFromHexString(currentUserId) },
    { $addToSet: { following: ObjectId.createFromHexString(targetUserId) } }
  )
  await userCollection.updateOne(
    { _id: ObjectId.createFromHexString(targetUserId) },
    { $addToSet: { followers: ObjectId.createFromHexString(currentUserId) } }
  )
}

async function unFollowUser(targetUserId, currentUserId) {
  const userCollection = await dbService.getCollection('user')
  await userCollection.updateOne(
    { _id: ObjectId.createFromHexString(currentUserId) },
    { $pull: { following: ObjectId.createFromHexString(targetUserId) } }
  )
  await userCollection.updateOne(
    { _id: ObjectId.createFromHexString(targetUserId) },
    { $pull: { followers: ObjectId.createFromHexString(currentUserId) } }
  )
}
async function toggleSaveStory(storyId, loggedinUserId) {
	try {
		const userCollection = await dbService.getCollection('user');
		const userObjectId = ObjectId.createFromHexString(loggedinUserId);
		const storyObjectId = ObjectId.createFromHexString(storyId);

		const user = await userCollection.findOne({ _id: userObjectId });

		const savedList = user.savedStoryIds || [];

		const isAlreadySaved = savedList.some(id => id.equals(storyObjectId));

		let res;
		if (isAlreadySaved) {
			// אם כבר שמור - נוריד אותו
			res = await userCollection.updateOne(
				{ _id: userObjectId },
				{ $pull: { savedStoryIds: storyObjectId } }
			);
			console.log('Story unsaved');
		} else {
			// אם לא שמור - נוסיף אותו
			res = await userCollection.updateOne(
				{ _id: userObjectId },
				{ $addToSet: { savedStoryIds: storyObjectId } }
			);
			console.log('Story saved');
		}

		console.log('Matched:', res.matchedCount, 'Modified:', res.modifiedCount);
	} catch (err) {
		console.error('Error in toggleSaveStory:', err);
	}
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria,
            },
            {
                fullname: txtCriteria,
            },
        ]
    }
    if (filterBy.minBalance) {
        criteria.score = { $gte: filterBy.minBalance }
    }
    return criteria
}