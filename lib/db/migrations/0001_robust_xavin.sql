CREATE INDEX "comments_todo_id_idx" ON "comments" USING btree ("todo_id");--> statement-breakpoint
CREATE INDEX "comments_user_id_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "todos_user_id_idx" ON "todos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "todos_workspace_id_idx" ON "todos" USING btree ("workspace_id");