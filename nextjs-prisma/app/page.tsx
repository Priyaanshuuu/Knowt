import prisma from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();

  return (
   <div>
    <h1>
      Hello from the landing page
    </h1>
    <div>
      <h2>Users:</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
   </div>
  );
}