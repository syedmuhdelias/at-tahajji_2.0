import { AdminEditor } from "@/components/site/AdminEditor";
import { adminUser, getContent } from "@/lib/site/server";
import { defaultContent } from "@/lib/site/defaults";
import { chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Site admin · My Quran",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  const [user, document] = await Promise.all([
    adminUser(),
    getContent().catch(() => null),
  ]);
  return (
    <AdminEditor
      initial={
        document || { content: defaultContent, revision: 0, updatedAt: null }
      }
      canSave={!!user && !!document}
      displayName={user?.displayName || null}
      loadError={!document}
      signInUrl={chatGPTSignInPath("/admin")}
      signOutUrl={chatGPTSignOutPath("/")}
    />
  );
}
