import { Home } from "@/components/site/Home";
import { getContent } from "@/lib/site/server";
import { defaultContent } from "@/lib/site/defaults";
export const dynamic = "force-dynamic";
export default async function Page() {
  const document = await getContent().catch(() => null);
  return <Home content={document?.content || defaultContent} />;
}
