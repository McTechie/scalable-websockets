// default imports
import * as schema from './schema';

// named imports
import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';

export const db = drizzle(sql, { schema });
