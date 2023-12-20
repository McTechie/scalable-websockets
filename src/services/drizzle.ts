// default imports
import * as schema from '../db/schema';

// named imports
import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';

class DrizzleService {
  private static _db = drizzle(sql, { schema });
  
  public static get db() {
    return this._db;
  }
}

export default DrizzleService;
