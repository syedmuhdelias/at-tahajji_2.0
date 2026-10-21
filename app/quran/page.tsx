import QuranReader from "@/components/quran/QuranReader";
import { getContent } from "@/lib/site/server";
import { defaultContent } from "@/lib/site/defaults";
export const dynamic = "force-dynamic";
export const metadata = { title: "Read Quran · My Quran" };
export default async function Page() {
  const document = await getContent().catch(() => null);
  return (
    <QuranReader branding={(document?.content || defaultContent).branding} />
  );
}
