import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }

  const sql = neon(url)
  await sql`DROP SCHEMA IF EXISTS public CASCADE`
  await sql`CREATE SCHEMA public`
  console.log('Dropped and recreated public schema')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})