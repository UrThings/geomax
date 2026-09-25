import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Folder,
  Package,
  Settings,
  Star,
  Tag,
} from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { StatGraph } from "@/components/admin/stat-graph";
import { Card } from "@/components/ui/card";
import { getAdminStats, getDashboardStats } from "@/lib/data";
import { getSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

const QUICK_LINKS = [
  {
    href: "/admin/products/new",
    label: "Бараа нэмэх",
    description: "Шинэ бараа бүртгэх",
    icon: CheckCircle2,
  },
  {
    href: "/admin/products",
    label: "Барааны жагсаалт",
    description: "Бүх барааг удирдах",
    icon: Package,
  },
  {
    href: "/admin/categories",
    label: "Категори",
    description: "Категориудыг удирдах",
    icon: Folder,
  },
  {
    href: "/admin/settings",
    label: "Тохиргоо",
    description: "Сайтын тохиргоо болон нууц үг",
    icon: Settings,
  },
];

export default async function AdminDashboardPage() {
  const [stats, dashboardStats, settings] = await Promise.all([
    getAdminStats(),
    getDashboardStats(),
    getSettings(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Сайн байна уу, {settings.ownerName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Таны каталогийн бүртгэлийн хураангуй мэдээлэл.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
        <StatsCard
          label="Сайтад зочилсон"
          value={stats.siteViews}
          icon={Eye}
          hint="Сүүлийн 30 хоногийн хандлага"
          spark={dashboardStats.siteDaily.map((item) => item.count)}
        />
        <StatsCard label="Нийт бараа" value={stats.total} icon={Package} />
        <StatsCard label="Зарагдаагүй" value={stats.available} icon={Tag} />
        <StatsCard label="Зарагдсан" value={stats.sold} icon={CheckCircle2} />
        <StatsCard label="Онцлох" value={stats.featured} icon={Star} />
        <StatsCard label="Категори" value={stats.categoryCount} icon={Folder} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatGraph
          data={dashboardStats.siteDaily}
          title="Сайт руу орсон хүний тоо"
          tone="primary"
        />
        <StatGraph
          data={dashboardStats.productDaily}
          title="Барааг үзсэн тоо"
          subtitle="Бүх барааны хуудсуудын нийт үзэлт — сүүлийн 30 хоног"
          tone="sky"
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Түргэн үйлдэл</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          {QUICK_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full p-4 transition-shadow hover:shadow-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-semibold">{item.label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Нээх
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {stats.total === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <p className="font-semibold">Одоогоор бараа байхгүй байна</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Эхний бараагаа нэмж каталогио эхлүүлээрэй.
          </p>
        </div>
      ) : null}
    </div>
  );
}