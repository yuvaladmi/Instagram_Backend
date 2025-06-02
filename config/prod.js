export default function getConfigProd() {
  return {
    dbURL: process.env.DB_URL,
    dbName: process.env.DB_NAME || 'story_db'
  }
}