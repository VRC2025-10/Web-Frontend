import { getMe } from "@/lib/api/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
