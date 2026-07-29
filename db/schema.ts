import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  zone: text("zone").notNull(),
  price: integer("price").notNull(),
  commission: integer("commission").notNull(),
  bio: text("bio").notNull(),
  status: text("status").notNull().default("draft"),
  photoKey: text("photo_key"),
  telegramMessageId: integer("telegram_message_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const bookingRequests = sqliteTable("booking_requests", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id),
  telegramUserId: text("telegram_user_id").notNull(),
  telegramUsername: text("telegram_username"),
  customerName: text("customer_name"),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const botDrafts = sqliteTable("bot_drafts", {
  telegramUserId: text("telegram_user_id").primaryKey(),
  stage: text("stage").notNull(),
  payload: text("payload").notNull().default("{}"),
  updatedAt: text("updated_at").notNull(),
});
