// named imports
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  created_at: serial('created_at').notNull(),
});
