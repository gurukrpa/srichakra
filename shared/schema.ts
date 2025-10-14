import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
