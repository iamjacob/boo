// Server component layout for [username] route
// Handles server-side params and metadata

export async function generateMetadata({ params }) {
  const { username } = await params;
  return {
    title: `${username}${username.endsWith("s")?"'":"'s"} Boooks`,
    description: `Explore ${username}'s collection of books.`,
    // image of the shelf should be here
    // ...other metadata fields
  };
}

export default async function Layout({ children, params }) {
  const { username } = await params;
  // Pass username as a prop to client components if needed
  return (
    <div>
      {/* You can add server-side logic or wrappers here */}
      {children}
    </div>
  );
}
