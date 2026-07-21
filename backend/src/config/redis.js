import IORedis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
const isSecure = redisUrl.startsWith('rediss://')

const client = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  ...(isSecure ? { tls: {} } : {})
})

console.log('REDIS_URL:', redisUrl)
console.log('TLS enabled:', isSecure)

client.on('connect', () => {
  console.log('✅ Redis connected')
})

client.on('error', (err) => {
  console.error('Redis error:', err)
})

export async function redisConnection() {
  console.log('✅ Redis connection module loaded')
}

export default client