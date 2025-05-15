import { pgTable, text, serial, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin role enum to define permission levels
export const adminRoleEnum = pgEnum('admin_role', ['super_admin', 'admin', 'teacher', 'staff']);

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: adminRoleEnum("role").notNull().default('staff'),
  phone: text("phone"),
  designation: text("designation"),
  department: text("department"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: serial("created_by").references(() => adminUsers.id),
  lastLogin: timestamp("last_login"),
  currentlyLoggedIn: boolean("currently_logged_in").default(false),
});

// Session tracking for admin users
export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  adminId: serial("admin_id").references(() => adminUsers.id).notNull(),
  token: text("token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  loginTime: timestamp("login_time").defaultNow(),
  logoutTime: timestamp("logout_time"),
  isActive: boolean("is_active").notNull().default(true),
});

// Insert schemas for validation
export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  name: true,
  email: true,
  password: true,
  role: true,
  phone: true,
  designation: true,
  department: true,
  isActive: true,
});

export const insertAdminSessionSchema = createInsertSchema(adminSessions).pick({
  adminId: true,
  token: true,
  ipAddress: true,
  userAgent: true,
  isActive: true,
});

// TypeScript types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;
