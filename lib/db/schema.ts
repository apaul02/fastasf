import { pgTable, text, timestamp, boolean, integer, index, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "member"])

export const user = pgTable("user", {
       id: text('id').primaryKey(),
       name: text('name').notNull(),
       email: text('email').notNull().unique(),
       emailVerified: boolean('email_verified').notNull(),
       image: text('image'),
       createdAt: timestamp('created_at').notNull(),
       updatedAt: timestamp('updated_at').notNull(),
});

export const session = pgTable("session", {
       id: text('id').primaryKey(),
       expiresAt: timestamp('expires_at').notNull(),
       token: text('token').notNull().unique(),
       createdAt: timestamp('created_at').notNull(),
       updatedAt: timestamp('updated_at').notNull(),
       ipAddress: text('ip_address'),
       userAgent: text('user_agent'),
       userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
       id: text('id').primaryKey(),
       accountId: text('account_id').notNull(),
       providerId: text('provider_id').notNull(),
       userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
       accessToken: text('access_token'),
       refreshToken: text('refresh_token'),
       idToken: text('id_token'),
       accessTokenExpiresAt: timestamp('access_token_expires_at'),
       refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
       scope: text('scope'),
       password: text('password'),
       createdAt: timestamp('created_at').notNull(),
       updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
       id: text('id').primaryKey(),
       identifier: text('identifier').notNull(),
       value: text('value').notNull(),
       expiresAt: timestamp('expires_at').notNull(),
       createdAt: timestamp('created_at'),
       updatedAt: timestamp('updated_at')
});

export const workspace = pgTable("workspace", {
       id: text('id').primaryKey(),
       name: text('name').notNull(),
       createdAt: timestamp('created_at').notNull().defaultNow(),
       updatedAt: timestamp('updated_at').notNull().defaultNow(),
       userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
});

export const todos = pgTable("todos", {
       id: text('id').primaryKey(),
       title: text('title').notNull(),
       completed: boolean('completed').notNull().default(false),
       dueDate: text('due_date'),
       priority: integer('priority').notNull().default(1),
       createdAt: timestamp('created_at').notNull().defaultNow(),
       updatedAt: timestamp('updated_at').notNull().defaultNow(),
       workspaceId: text('workspace_id').notNull().references(()=> workspace.id, { onDelete: 'cascade' }),
       userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
}, (table) => ({
       userIdx: index("todos_user_id_idx").on(table.userId),
       workspaceIdx: index("todos_workspace_id_idx").on(table.workspaceId),
}))

export const comments = pgTable("comments", {
       id: text('id').primaryKey(),
       content: text('content').notNull(),
       createdAt: timestamp('created_at').notNull().defaultNow(),
       updatedAt: timestamp('updated_at').notNull().defaultNow(),
       todoId: text('todo_id').notNull().references(()=> todos.id, { onDelete: 'cascade' }),
       userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
}, (table) => ({
       todoIdx: index("comments_todo_id_idx").on(table.todoId),
       userIdx: index("comments_user_id_idx").on(table.userId)
}))

export const workspace_members = pgTable("workspace_members", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspace.id, { onDelete: 'cascade' }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
  role: roleEnum().default("member").notNull() 
}, (table) => ({
  workspaceUserIdx: index("workspace_members_workspace_user_idx")
    .on(table.workspaceId, table.userId),
}));

export const invites = pgTable("invites", {
  code: text("code").primaryKey(),                
  workspaceId: text("workspace_id").notNull().references(() => workspace.id, { onDelete: 'cascade' }),
  expiresAt: timestamp("expires_at").notNull(),   
  createdBy: text("created_by").notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
