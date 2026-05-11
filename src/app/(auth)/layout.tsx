import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/services/jwt";
import UserProvider from "@/components/context/user-context";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const decodedUser = verifyToken(token);

  if (!decodedUser) {
    redirect("/login");
  }

  const initialUser = {
    id: decodedUser.id,
    name: decodedUser.name || "User",
    email: decodedUser.email,
  };

  return (
    <UserProvider initialUser={initialUser}>
      {children}
    </UserProvider>
  );
}