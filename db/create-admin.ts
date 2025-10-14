// Create initial admin user script
import { db } from "./index";
import * as adminSchema from "../shared/admin-schema";

async function createAdminUser() {
  try {
    console.log("Creating initial super admin user...");

    // Check if admin already exists
    const existingAdmin = await db.query.adminUsers.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@srichakra.com"),
    });

    if (existingAdmin) {
      console.log("Admin user already exists, skipping creation");
      return;
    }

    // Create the admin user
    const result = await db.insert(adminSchema.adminUsers).values({
      name: "Super Admin",
      email: "admin@srichakra.com",
      password: "admin123", // In production, this should be hashed
      role: "super_admin",
      isActive: true,
    });

    console.log("Successfully created super admin user");
    console.log("Email: admin@srichakra.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    process.exit();
  }
}

createAdminUser();
