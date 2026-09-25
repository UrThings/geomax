import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { getSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <PageViewTracker />
      <Navbar siteTitle={settings.siteTitle || settings.ownerName} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}