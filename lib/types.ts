//   id: string;
// export interface Todos {
//   title: string;
//   completed: boolean;
//   dueDate?: string | null;
//   priority: number;
//   createdAt: Date;
//   updatedAt: Date;
//   workspaceId: string;
//   userId: string;
//   comments?: Comments[];
// }

import { comments, todos, workspace } from "./db/schema";

// export interface Workspace {
//   id: string;
//   name: string;
//   createdAt: Date;
//   updatedAt: Date;
//   userId: string;
//   todos?: Todos[];
// }

// export interface Comments {
//   id: string;
//   content: string;
//   createdAt: Date;
//   updatedAt: Date;
//   todoId: string;
//   userId: string;
// }

export type TodosType = typeof todos.$inferSelect;
export type workspaceType = typeof workspace.$inferSelect;
export type commentsType = typeof comments.$inferSelect;

// export type CategoryType = {
//   id: string;
//   title: string;
//   todos: TodosType[];
//   bgColorClass: string;
//   emptyMessage: string
// }

export type TActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: { message: string; code?: 'AUTH_ERROR' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR' | 'DB_ERROR' }}
