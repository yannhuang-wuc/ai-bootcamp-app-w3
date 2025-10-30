"use client";

import {
  Inbox,
  LockIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { LoginDialog } from "@/features/auth/components/login-dialog";
import { User } from "@/features/auth/utils/user";
import type { Todo } from "../../../../generated/prisma/client";
import { deleteTodo, toggleTodoComplete } from "../server/actions";
import { EditTodoDialog } from "./edit-todo-dialog";
import { TodoDetailsDialog } from "./todo-details-dialog";

export const TodoItemList = ({ todos }: { todos: Todo[] }) => {
  const { session } = User();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  if (!session?.user) {
    return (
      <>
        {/* Overlay */}
        <div className='inset-0 bg-primary-foreground h-full rounded-lg flex items-center justify-center'>
          <div className='text-center space-y-4 p-6'>
            <div className='flex justify-center'>
              <div className='rounded-full bg-primary/10 p-4'>
                <LockIcon className='h-12 w-12 text-primary' />
              </div>
            </div>
            <div className='space-y-2'>
              <h3 className='text-2xl font-bold'>Sign in Required</h3>
              <p className='text-muted-foreground max-w-sm'>
                Please sign in to view and manage your todos
              </p>
            </div>
            <Button
              size='lg'
              onClick={() => setIsLoginDialogOpen(true)}
              className='mt-4'>
              Sign In to Continue
            </Button>
          </div>
        </div>
        <LoginDialog
          open={isLoginDialogOpen}
          onOpenChange={setIsLoginDialogOpen}
        />
      </>
    );
  }

  if (todos.length === 0) {
    return (
      <div className='inset-0 bg-primary-foreground h-full rounded-lg flex items-center justify-center'>
        <div className='text-center space-y-4 p-6'>
          <div className='flex justify-center'>
            <div className='rounded-full bg-primary/10 p-4'>
              <Inbox className='h-12 w-12 text-primary' />
            </div>
          </div>
          <div className='space-y-2'>
            <h3 className='text-2xl font-bold'>No todos found</h3>
            <p className='text-muted-foreground max-w-sm'>
              You don't have any todos yet. Create one to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-full min-w-sm max-w-lg flex-col items-center gap-4 h-80 overflow-y-auto'>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

export const TodoItem = ({ todo }: { todo: Todo }) => {
  const [isChecked, setIsChecked] = useState(todo.completed);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTodo(todo.id);
      if (result?.success) {
        toast.success(result.message);
      } else {
        toast.error(result?.message || "Failed to delete todo");
      }
    });
  };

  const handleToggleComplete = (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleTodoComplete(todo.id, checked);
      if (result?.success) {
        toast.success(result.message);
        setIsChecked(!isChecked);
      } else {
        toast.error(result?.message || "Failed to update todo");
      }
    });
  };

  const handleItemClick = (e: React.MouseEvent) => {
    // Don't open details if clicking on checkbox, buttons, or dropdown
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('[role="checkbox"]') ||
      target.closest('[role="menu"]')
    ) {
      return;
    }
    setIsDetailsDialogOpen(true);
  };

  return (
    <>
      <EditTodoDialog
        todo={todo}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <TodoDetailsDialog
        todo={todo}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
      <div className='flex w-full min-w-sm max-w-md flex-col gap-6'>
        <Item
          variant='outline'
          className='w-full cursor-pointer hover:bg-muted/50 transition-colors'
          onClick={handleItemClick}>
          <ItemMedia>
            <Checkbox
              checked={isChecked}
              onCheckedChange={handleToggleComplete}
              disabled={isPending}
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className={isChecked ? "line-through opacity-60" : ""}>
              {todo.title}
            </ItemTitle>
            {todo.description && (
              <ItemDescription className='line-clamp-2'>
                {todo.description}
              </ItemDescription>
            )}
          </ItemContent>
          <ItemActions>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' disabled={isPending}>
                  <MoreVerticalIcon className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <PencilIcon className='size-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} variant='destructive'>
                  <TrashIcon className='size-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ItemActions>
        </Item>
      </div>
    </>
  );
};
