import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core"

/**
 * Contact form submissions / leads
 */
export const contactLeads = sqliteTable("contact_leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email").notNull(),
  projectType: text("project_type"),
  propertyAddress: text("property_address"),
  message: text("message"),
  createdAt: text("created_at").notNull(),
  emailSent: integer("email_sent", { mode: "boolean" }).default(false),
})
