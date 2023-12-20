// type imports
import type { Config } from 'drizzle-kit';

// default imports
import 'dotenv/config';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_NAME || 'postgres',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    connectionString: process.env.POSTGRES_URL || '',
    ssl: false
  },
} satisfies Config;
