import { UserProfile } from "@/features/auth/components/user-profile";
import { getServerSession } from "@/features/auth/lib/main";
import { CreateTodoForm } from "@/features/todo/components/create-todo-form";
import { TodoItemList } from "@/features/todo/components/todo-item-list";
import db from "@/lib/db";

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
  const session = await getServerSession();

  const todos = await db.todo.findMany({
    where: {
      createdBy: session?.user?.id,
    },
    include: {
      createdByUser: true,
    },
  });

  const randomTodo =
    DUMMY_TODOS[Math.floor(Math.random() * DUMMY_TODOS.length)];
  return (
    <div className='flex flex-col min-h-screen'>
      {/* Header with User Profile */}
      <header className='sticky top-0 z-50 w-full border-b bg-background'>
        <div className='flex h-16 items-center justify-between px-4'>
          <h1 className='text-2xl font-bold'>WUC Todo App</h1>
          <UserProfile />
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 flex flex-col items-center p-6 pt-12'>
        <div className='w-full max-w-6xl space-y-8'>
          <div className='text-center space-y-2'>
            <h2 className='text-2xl md:text-4xl font-extrabold tracking-tight'>
              Manage Your Todos
            </h2>
            <p className='text-muted-foreground text-base md:text-lg text-balance'>
              Stay organized and productive with our simple todo app
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='col-span-1 flex justify-center md:justify-end'>
              <CreateTodoForm randomTodo={randomTodo} />
            </div>
            <div className='col-span-1 justify-center'>
              <TodoItemList todos={todos} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
