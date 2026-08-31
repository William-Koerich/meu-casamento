import { relations } from "drizzle-orm"

import { budgetCategories, budgetItems, payments } from "@/db/schema/budget"
import { documents } from "@/db/schema/documents"
import { gifts } from "@/db/schema/gifts"
import { guests } from "@/db/schema/guests"
import { honeymoon } from "@/db/schema/honeymoon"
import { inspirations } from "@/db/schema/inspirations"
import { profiles } from "@/db/schema/profiles"
import { tables } from "@/db/schema/seating"
import { songs } from "@/db/schema/songs"
import { tasks } from "@/db/schema/tasks"
import { timelineEvents } from "@/db/schema/timeline-events"
import { trousseauItems } from "@/db/schema/trousseau"
import { vendors } from "@/db/schema/vendors"
import { weddingMembers } from "@/db/schema/wedding-members"
import { weddings } from "@/db/schema/weddings"

export const weddingsRelations = relations(weddings, ({ many, one }) => ({
  owner: one(profiles, { fields: [weddings.ownerId], references: [profiles.id] }),
  members: many(weddingMembers),
  tasks: many(tasks),
  vendors: many(vendors),
  budgetCategories: many(budgetCategories),
  budgetItems: many(budgetItems),
  payments: many(payments),
  guests: many(guests),
  tables: many(tables),
  timelineEvents: many(timelineEvents),
  inspirations: many(inspirations),
  songs: many(songs),
  gifts: many(gifts),
  trousseauItems: many(trousseauItems),
  documents: many(documents),
  honeymoon: many(honeymoon),
}))

export const weddingMembersRelations = relations(weddingMembers, ({ one }) => ({
  wedding: one(weddings, {
    fields: [weddingMembers.weddingId],
    references: [weddings.id],
  }),
  profile: one(profiles, {
    fields: [weddingMembers.userId],
    references: [profiles.id],
  }),
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  wedding: one(weddings, { fields: [tasks.weddingId], references: [weddings.id] }),
  responsavel: one(profiles, {
    fields: [tasks.responsavelId],
    references: [profiles.id],
  }),
}))

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  wedding: one(weddings, { fields: [vendors.weddingId], references: [weddings.id] }),
  budgetItems: many(budgetItems),
  documents: many(documents),
}))

export const budgetCategoriesRelations = relations(budgetCategories, ({ one, many }) => ({
  wedding: one(weddings, {
    fields: [budgetCategories.weddingId],
    references: [weddings.id],
  }),
  items: many(budgetItems),
}))

export const budgetItemsRelations = relations(budgetItems, ({ one, many }) => ({
  wedding: one(weddings, { fields: [budgetItems.weddingId], references: [weddings.id] }),
  category: one(budgetCategories, {
    fields: [budgetItems.categoryId],
    references: [budgetCategories.id],
  }),
  vendor: one(vendors, { fields: [budgetItems.vendorId], references: [vendors.id] }),
  payments: many(payments),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  wedding: one(weddings, { fields: [payments.weddingId], references: [weddings.id] }),
  budgetItem: one(budgetItems, {
    fields: [payments.budgetItemId],
    references: [budgetItems.id],
  }),
}))

export const tablesRelations = relations(tables, ({ one, many }) => ({
  wedding: one(weddings, { fields: [tables.weddingId], references: [weddings.id] }),
  guests: many(guests),
}))

export const guestsRelations = relations(guests, ({ one }) => ({
  wedding: one(weddings, { fields: [guests.weddingId], references: [weddings.id] }),
  table: one(tables, { fields: [guests.tableId], references: [tables.id] }),
}))

export const documentsRelations = relations(documents, ({ one }) => ({
  wedding: one(weddings, { fields: [documents.weddingId], references: [weddings.id] }),
  vendor: one(vendors, { fields: [documents.vendorId], references: [vendors.id] }),
}))

export const honeymoonRelations = relations(honeymoon, ({ one }) => ({
  wedding: one(weddings, { fields: [honeymoon.weddingId], references: [weddings.id] }),
}))

export const profilesRelations = relations(profiles, ({ many }) => ({
  weddingMemberships: many(weddingMembers),
  tarefasResponsavel: many(tasks),
}))
