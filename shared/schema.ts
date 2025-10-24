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

// Schools table for managing school accounts
export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

// School students table for managing students assigned to schools
export const schoolStudents = pgTable("school_students", {
  id: serial("id").primaryKey(),
  schoolCode: text("school_code").notNull(),
  studentId: text("student_id").notNull(),
  studentName: text("student_name").notNull(),
  parentName: text("parent_name"),
  class: text("class"),
  expectedEmail: text("expected_email"),
  claimedEmail: text("claimed_email"),
  status: text("status").notNull().default('pending'), // pending | registered | completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertSchoolSchema = createInsertSchema(schools).pick({
  name: true,
  email: true,
  password: true,
  code: true,
  isActive: true,
});

export const insertSchoolStudentSchema = createInsertSchema(schoolStudents).pick({
  schoolCode: true,
  studentId: true,
  studentName: true,
  parentName: true,
  class: true,
  expectedEmail: true,
  claimedEmail: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type SchoolStudent = typeof schoolStudents.$inferSelect;
export type InsertSchoolStudent = z.infer<typeof insertSchoolStudentSchema>;
