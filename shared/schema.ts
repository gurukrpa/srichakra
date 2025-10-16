import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  studentName: text("student_name"),
  parentName: text("parent_name"),
  schoolName: text("school_name"),
  age: text("age"),
  occupation: text("occupation"),
  city: text("city"),
  country: text("country"),
  notes: text("notes"),
});

// User sessions table for tracking user activity
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  sessionToken: text("session_token"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  loginTime: timestamp("login_time").defaultNow(),
  logoutTime: timestamp("logout_time"),
  lastActivity: timestamp("last_activity").defaultNow(),
  isActive: boolean("is_active").default(true),
  sessionType: text("session_type").default('web'), // 'web', 'mobile', 'guest'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  studentName: true,
  parentName: true,
  schoolName: true,
  age: true,
  occupation: true,
  city: true,
  country: true,
  notes: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).pick({
  userId: true,
  sessionToken: true,
  ipAddress: true,
  userAgent: true,
  sessionType: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
