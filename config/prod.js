
export default {
    dbURL: process.env.MONGO_URL,
    dbName: process.env.DB_NAME || 'story_db'
}

// export default {
//     dbURL: mongodb+srv://dbUser:yuval3008@cluster0.ronkbnq.mongodb.net/,
//     dbName: process.env.DB_NAME || 'instagram_db'
// }
