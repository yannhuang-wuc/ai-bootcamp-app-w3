import { CheckCircle2Icon, SparklesIcon } from "lucide-react";
import { CreateTodoForm } from "@/features/todo/components/create-todo-form";
import { TodoItemList } from "@/features/todo/components/todo-item-list";
import db from "@/lib/db";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

const DUMMY_TODOS = [
  {
    title: "Buy groceries for the week",
    description:
      "Get milk, eggs, bread, fruits, vegetables, and other essentials from the supermarket",
  },
  {
    title: "Schedule dentist appointment",
    description:
      "Call the dental clinic to book a checkup appointment for next month",
  },
  {
    title: "Finish reading current book",
    description: "Complete the last three chapters and write a brief review",
  },
  {
    title: "Plan weekend trip",
    description:
      "Research destinations, book accommodation, and create an itinerary for the family vacation",
  },
  {
    title: "Exercise for 30 minutes",
    description: "Go for a jog in the park or do a home workout routine",
  },
  {
    title: "Call mom and catch up",
    description: "Have a video call to check in and share recent updates",
  },
  {
    title: "Organize home office",
    description:
      "Declutter desk, file documents, and clean up workspace for better productivity",
  },
  {
    title: "Pay monthly bills",
    description:
      "Review and pay electricity, internet, and credit card bills before due date",
  },
  {
    title: "Learn a new recipe",
    description:
      "Try making homemade pasta or baking sourdough bread this weekend",
  },
  {
    title: "Clean out email inbox",
    description:
      "Unsubscribe from unwanted newsletters and organize important emails into folders",
  },
];

export default async function Page() {
  const todos = await db.todo.findMany({
    orderBy: { createdAt: "desc" },
  });

  const randomTodo =
    DUMMY_TODOS[Math.floor(Math.random() * DUMMY_TODOS.length)];

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className='flex min-h-screen flex-col'>
      {/* Header */}
      <header className='glass-card sticky top-0 z-50 border-b border-border/50'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-xl bg-primary/10'>
              <CheckCircle2Icon className='size-5 text-primary' />
            </div>
            <h1
              className='text-xl font-semibold tracking-tight'
              style={{ fontFamily: "var(--font-outfit)" }}>
              WUC Todo v2-2026.02.06 09:32am
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className='flex flex-1 flex-col px-6 py-12'>
        <div className='mx-auto w-full max-w-6xl space-y-12'>
          {/* Hero Section */}
          <section className='animate-fade-in-up space-y-6 text-center'>
            <div className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary'>
              <SparklesIcon className='size-4' />
              <span>Stay organized, stay productive</span>
            </div>

            <h2
              className='text-gradient text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'
              style={{ fontFamily: "var(--font-outfit)" }}>
              Manage Your Todos
            </h2>

            <p className='mx-auto max-w-2xl text-balance text-lg text-muted-foreground'>
              A beautiful, simple way to keep track of everything you need to
              do. Create, organize, and complete your tasks with ease.
            </p>

            {/* Stats */}
            {totalCount > 0 && (
              <div className='flex items-center justify-center gap-8 pt-4'>
                <div className='text-center'>
                  <p
                    className='text-3xl font-bold text-primary'
                    style={{ fontFamily: "var(--font-outfit)" }}>
                    {totalCount}
                  </p>
                  <p className='text-sm text-muted-foreground'>Total Tasks</p>
                </div>
                <div className='h-8 w-px bg-border' />
                <div className='text-center'>
                  <p
                    className='text-3xl font-bold text-primary'
                    style={{ fontFamily: "var(--font-outfit)" }}>
                    {completedCount}
                  </p>
                  <p className='text-sm text-muted-foreground'>Completed</p>
                </div>
                <div className='h-8 w-px bg-border' />
                <div className='text-center'>
                  <p
                    className='text-3xl font-bold text-primary'
                    style={{ fontFamily: "var(--font-outfit)" }}>
                    {totalCount - completedCount}
                  </p>
                  <p className='text-sm text-muted-foreground'>Remaining</p>
                </div>
              </div>
            )}
          </section>

          {/* Content Grid */}
          <section className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
            {/* Create Form */}
            <div className='animate-fade-in-up animate-delay-100 flex justify-center lg:justify-end'>
              <CreateTodoForm randomTodo={randomTodo} />
            </div>

            {/* Todo List */}
            <div className='animate-fade-in-up animate-delay-200 flex justify-center lg:justify-start'>
              <TodoItemList todos={todos} />
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className='border-t border-border/50 py-6'>
        <div className='mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground'>
          <p>Built with care · WUC Todo App</p>
        </div>
      </footer>
    </div>
  );
}
