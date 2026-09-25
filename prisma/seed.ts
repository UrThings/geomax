import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { Role, ProductCondition, ProductStatus } from "../lib/generated/prisma/enums";
import type { Prisma } from "../lib/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  }),
});

function pic(seed: string, index: number, width = 800, height = 600) {
  return `https://picsum.photos/seed/${seed}-${index}/${width}/${height}`;
}

const CATEGORIES: {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}[] = [
  {
    name: "Гар утас",
    slug: "gar-utas",
    description: "Ухаан гар утас, аксессуар",
    sortOrder: 0,
  },
  {
    name: "Компьютер",
    slug: "kompyuter",
    description: "Ноутбук, ширээний компьютер, перифери",
    sortOrder: 1,
  },
  {
    name: "Телевизор",
    slug: "televizor",
    description: "Телевизор, дэлгэц",
    sortOrder: 2,
  },
  {
    name: "Аудио",
    slug: "audio",
    description: "Чихэвч, чанга яригч, хөгжмийн төхөөрөмж",
    sortOrder: 3,
  },
  {
    name: "Гэр ахуйн цахилгаан",
    slug: "ger-ahuin-tsahilgaan",
    description: "Гэр ахуйн цахилгаан бараа",
    sortOrder: 4,
  },
  {
    name: "Хувцас",
    slug: "huvtsas",
    description: "Хувцас, гутал, дагалдах хэрэгсэл",
    sortOrder: 5,
  },
  {
    name: "Тавилга",
    slug: "tavilga",
    description: "Гэр, оффисын тавилга",
    sortOrder: 6,
  },
  {
    name: "Спорт",
    slug: "sport",
    description: "Спортын бараа, тоног төхөөрөмж",
    sortOrder: 7,
  },
  {
    name: "Бусад",
    slug: "busad",
    description: "Дээрх ангилалд багтахгүй бараа",
    sortOrder: 8,
  },
];

type SeedProduct = {
  name: string;
  categorySlug: string;
  price: number;
  condition: ProductCondition;
  status: ProductStatus;
  location: string;
  featured?: boolean;
  daysAgo: number;
  description: string;
  specs: Record<string, string>;
  imageCount: number;
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Apple iPhone 13 Pro 256GB",
    categorySlug: "gar-utas",
    price: 2100000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Хан-Уул",
    featured: true,
    daysAgo: 1,
    description:
      "Apple iPhone 13 Pro, 256GB санах ойтой. Алтан өнгөтэй. Батерей хувь 88%.\n\nАшиглалтын үед ямар нэгэн доголдол гарч байгаагүй. Аралд нь сайн хадгалсан.\n\nХамт нь силикон кейс болон цэнэглэгч утас өгнө.",
    specs: {
      "Санах ой": "256GB",
      Өнгө: "Golden",
      Батерей: "88%",
      "Үйлдлийн систем": "iOS 17",
    },
    imageCount: 3,
  },
  {
    name: "Samsung Galaxy S23 Ultra",
    categorySlug: "gar-utas",
    price: 2600000,
    condition: ProductCondition.LIKE_NEW,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Сүхбаатар",
    featured: true,
    daysAgo: 2,
    description:
      "Samsung Galaxy S23 Ultra, 512GB. Хар өнгөтэй, бараг шинэ.\n\nS-Pen болон бүрэн багцтай. Зөвхөн 6 сар ашигласан.\n\nБаталгаат хугацаа нь дуусаагүй байна.",
    specs: {
      "Санах ой": "512GB",
      Өнгө: "Phantom Black",
      RAM: "12GB",
      Батерей: "5000mAh",
    },
    imageCount: 3,
  },
  {
    name: "Xiaomi Poco X5 Pro 8/256",
    categorySlug: "gar-utas",
    price: 950000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Баянгол",
    daysAgo: 4,
    description:
      "Xiaomi Poco X5 Pro, 8GB RAM, 256GB. Цэнхэр өнгөтэй.\n\nБатерей хувь 92%. Хэрэглэсэн ч сайн эстэй.\n\nХамт нь кабел өгнө.",
    specs: {
      "Санах ой": "256GB",
      RAM: "8GB",
      Өнгө: "Blue",
    },
    imageCount: 2,
  },
  {
    name: "iPhone 11 64GB",
    categorySlug: "gar-utas",
    price: 1100000,
    condition: ProductCondition.USED,
    status: ProductStatus.SOLD,
    location: "УБ, Чингэлтэй",
    daysAgo: 6,
    description:
      "iPhone 11, 64GB, улаан өнгөтэй.\n\nХэрэглэсэн ч төгс ажилдаг. Батерей хувь 84%.\n\nЭнэ бараа зарагдсан.",
    specs: {
      "Санах ой": "64GB",
      Өнгө: "Red",
    },
    imageCount: 2,
  },
  {
    name: "MacBook Air M2 13.6\"",
    categorySlug: "kompyuter",
    price: 4200000,
    condition: ProductCondition.LIKE_NEW,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Сүхбаатар",
    featured: true,
    daysAgo: 1,
    description:
      "MacBook Air M2 13.6 инч, 8GB RAM, 256GB SSD. Миднайт өнгөтэй.\n\nЗөвхөн сургуулийн хичээлд ашигласан, хальс нь хүртэл салгаагүй.\n\nАдаптер болон кейстэй хамт өгнө.",
    specs: {
      Чип: "Apple M2",
      RAM: "8GB",
      SSD: "256GB",
      Дэлгэц: "13.6 inch",
    },
    imageCount: 4,
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 9",
    categorySlug: "kompyuter",
    price: 2800000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Хан-Уул",
    daysAgo: 3,
    description:
      "Lenovo ThinkPad X1 Carbon Gen 9, i7-1165G7, 16GB RAM, 512GB SSD.\n\nАжил хэргийн зориулалтаар ашиглагдсан. Сайн төлөвтэй, хурдан ажилладаг.\n\nЦэнэглэгч хамт.",
    specs: {
      Процессор: "Intel i7-1165G7",
      RAM: "16GB",
      SSD: "512GB",
      Жин: "1.13kg",
    },
    imageCount: 3,
  },
  {
    name: "Dell XPS 13 9310",
    categorySlug: "kompyuter",
    price: 2400000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Баянгол",
    daysAgo: 5,
    description:
      "Dell XPS 13 9310, i7-1185G7, 16GB RAM, 512GB. Платнатино silence өнгөтэй.\n\nХөнгөн, гоёмсог дизайнтай ноутбук. Оффисын хэрэглээнд маш тохиромжтой.",
    specs: {
      Процессор: "Intel i7-1185G7",
      RAM: "16GB",
      SSD: "512GB",
      Дэлгэц: "13.4 inch FHD+",
    },
    imageCount: 2,
  },
  {
    name: "Logitech MX Master 3S",
    categorySlug: "kompyuter",
    price: 180000,
    condition: ProductCondition.LIKE_NEW,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Сүхбаатар",
    daysAgo: 2,
    description:
      "Logitech MX Master 3S утасгүй хулгана.\n\nГрафик дизайн, програмистын хэрэглээнд тохиромжтой. Бараг шинэ.\n\nUSB receiver ба Bluetooth хоёроор холбогддог.",
    specs: {
      Холболт: "Bluetooth / USB",
      DPI: "8000",
      Батерей: "USB-C",
    },
    imageCount: 1,
  },
  {
    name: "Samsung 65\" QLED 4K Smart TV",
    categorySlug: "televizor",
    price: 3400000,
    condition: ProductCondition.LIKE_NEW,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Чингэлтэй",
    featured: true,
    daysAgo: 1,
    description:
      "Samsung 65 инч QLED 4K Smart TV.\n\nГэрийн хэрэглээнд 8 сар ашигласан. Гэрлэлтийн улмаас зарж байна.\n\nАлсын удирдлага болон тавиуртай хамт өгнө.",
    specs: {
      Хэмжээ: "65 inch",
      Тодорхол: "4K QLED",
      Smart: "Tizen OS",
      Холболт: "HDMI x4",
    },
    imageCount: 3,
  },
  {
    name: "Sony Bravia 55\" 4K TV",
    categorySlug: "televizor",
    price: 2200000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Баянзүрх",
    daysAgo: 7,
    description:
      "Sony Bravia 55 инч 4K Android Smart TV.\n\nХэрэглэсэн ч зураг тод, ажиллагаа хэвийн.\n\nГэрийн хэрэглээнд тохиромжтой.",
    specs: {
      Хэмжээ: "55 inch",
      Тодорхол: "4K",
      Smart: "Android TV",
    },
    imageCount: 2,
  },
  {
    name: "LG OLED 48\" C2",
    categorySlug: "televizor",
    price: 2600000,
    condition: ProductCondition.USED,
    status: ProductStatus.SOLD,
    location: "УБ, Хан-Уул",
    daysAgo: 10,
    description:
      "LG OLED 48 инч C2 series.\n\nOLED технологийн гайхалтай өнгөний гүн. Gaming-д тохиромжтой.\n\nЭнэ бараа зарагдсан.",
    specs: {
      Хэмжээ: "48 inch",
      Тодорхол: "4K OLED",
    },
    imageCount: 2,
  },
  {
    name: "Sony WH-1000XM5",
    categorySlug: "audio",
    price: 750000,
    condition: ProductCondition.LIKE_NEW,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Сүхбаатар",
    featured: true,
    daysAgo: 1,
    description:
      "Sony WH-1000XM5 дуу чимээг дарангуйлах чихэвч.\n\nСайн төлөвтэй, кассын хайрцагтай хамт.\n\nНислэг, ажил, сурлагад маш тохиромжтой.",
    specs: {
      Төрөл: "Over-ear",
      ANC: "Тийм",
      Батерей: "30 цаг",
      Холболт: "Bluetooth 5.2",
    },
    imageCount: 3,
  },
  {
    name: "Marshall Acton III",
    categorySlug: "audio",
    price: 640000,
    condition: ProductCondition.NEW,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Чингэлтэй",
    daysAgo: 3,
    description:
      "Marshall Acton III bluetooth чанга яригч.\n\nШинэ, шууд дэлгүүрээс. Баталгаат.\n\nГоёмсог дизайн, баялаг дуу чимээ.",
    specs: {
      Төрөл: "Bluetooth speaker",
      Гаралт: "30W",
    },
    imageCount: 2,
  },
  {
    name: "JBL Charge 5",
    categorySlug: "audio",
    price: 520000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Баянгол",
    daysAgo: 6,
    description:
      "JBL Charge 5 чийгэнд тэсвэртэй bluetooth чанга яригч.\n\nГар утас цэнэглэх функцийг дэмждэг. Сайн төлөвтэй.",
    specs: {
      Төрөл: "Bluetooth speaker",
      USB: "USB-C",
    },
    imageCount: 1,
  },
  {
    name: "AirPods Pro 2",
    categorySlug: "audio",
    price: 450000,
    condition: ProductCondition.USED,
    status: ProductStatus.SOLD,
    location: "УБ, Хан-Уул",
    daysAgo: 9,
    description:
      "AirPods Pro 2, орон нутгийн баталгаатай.\n\nЭнэ бараа зарагдсан.",
    specs: {
      ANC: "Тийм",
      "Санах ой": "MagSafe",
    },
    imageCount: 2,
  },
  {
    name: "Индукцийн зуух 2 шатахуун",
    categorySlug: "ger-ahuin-tsahilgaan",
    price: 420000,
    condition: ProductCondition.LIKE_NEW,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Баянзүрх",
    daysAgo: 2,
    description:
      "2 шатахуунтай ширээний индукцийн зуух.\n\nГал тогоонд маш хурдан, аюулгүй хоол хийнэ.\n\nБараг шинэ, 3 сар ашигласан.",
    specs: {
      Шатахуун: "2",
      Хүчдэл: "220V",
    },
    imageCount: 2,
  },
  {
    name: "Dyson V11 vacuum",
    categorySlug: "ger-ahuin-tsahilgaan",
    price: 1100000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Сүхбаатар",
    featured: true,
    daysAgo: 1,
    description:
      "Dyson V11 утасгүй vacuum cleaner.\n\nХүчтэй соруулагч, батерей нь 60 минут ажилладаг.\n\nГэрийн хэрэглээнд маш тохиромжтой.",
    specs: {
      Ажиллах: "60 минут",
      Батерей: "23.15Wh",
    },
    imageCount: 3,
  },
  {
    name: "Robot vacuum Xiaomi S10",
    categorySlug: "ger-ahuin-tsahilgaan",
    price: 380000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Чингэлтэй",
    daysAgo: 5,
    description:
      "Xiaomi Mi Robot Vacuum S10.\n\nWi-Fi-гээр удирдана. Газар шүүрдэж, арчдаг.\n\nСайн төлөвтэй, хэрэглэсэн.",
    specs: {
      Удирдлага: "Wi-Fi + App",
      Шүүрдэх: "Тийм",
    },
    imageCount: 2,
  },
  {
    name: "North Face куртка",
    categorySlug: "huvtsas",
    price: 350000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Хан-Уул",
    daysAgo: 3,
    description:
      "The North Face өвлийн куртка, хар өнгөтэй, 3-р хэмжээ.\n\nДулаан 21-р зэрэг. Гэрийн хэрэглээнд хэрэглэсэн.",
    specs: {
      Хэмжээ: "3",
      Өнгө: "Black",
    },
    imageCount: 2,
  },
  {
    name: "Намрын пальто",
    categorySlug: "huvtsas",
    price: 280000,
    condition: ProductCondition.LIKE_NEW,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Баянгол",
    daysAgo: 4,
    description:
      "Намар-ховор хувцаслах пальто, 42-р хэмжээ.\n\nЗөвхөн 2 удаа өмссөн. Сайн төлөвтэй.\n\nШинэ юм шиг.",
    specs: {
      Хэмжээ: "42",
      Материал: "Wool blend",
    },
    imageCount: 1,
  },
  {
    name: "Nike Air Jordan 1",
    categorySlug: "huvtsas",
    price: 480000,
    condition: ProductCondition.USED,
    status: ProductStatus.SOLD,
    location: "УБ, Сүхбаатар",
    daysAgo: 8,
    description:
      "Nike Air Jordan 1, 9.5 хэмжээтэй гутал.\n\nЭнэ бараа зарагдсан.",
    specs: {
      Хэмжээ: "9.5 US",
    },
    imageCount: 2,
  },
  {
    name: "IKEA көмөд",
    categorySlug: "tavilga",
    price: 650000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Баянзүрх",
    daysAgo: 6,
    description:
      "IKEA Malm 6 шургуулгатай көмөд.\n\nГэрийн хэрэглээнд ашигласан. Сайн төлөвтэй.\n\nХувь хүнээс хямд үнээр зарна.",
    specs: {
      Хэмжээ: "160x50 cm",
      Шургуулга: "6",
    },
    imageCount: 2,
  },
  {
    name: "Стол оффисын самбартай",
    categorySlug: "tavilga",
    price: 450000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Сүхбаатар",
    daysAgo: 3,
    description:
      "Оффисын самбартай ширээ, 120x60 см.\n\nХэрэглэсэн ч бэхэлгээ нь сайн. Гэрт шинэ тавилга орж ирсэн тул зарж байна.",
    specs: {
      Хэмжээ: "120x60 cm",
      Материал: "MDF",
    },
    imageCount: 1,
  },
  {
    name: "Велосипед Scott 29",
    categorySlug: "sport",
    price: 780000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Хан-Уул",
    daysAgo: 5,
    description:
      "Scott Aspect 29 дугуйчны велосипед.\n\nСонины хүрд, амархан жолоодлого. Хэдэн сарын өмнөөс үйлчилгээ хийлгэсэн.\n\nХот болон хониномуудад тохиромжтой.",
    specs: {
      Хүрд: "29 inch",
      Рама: "Aluminum",
    },
    imageCount: 3,
  },
  {
    name: "Теннисийн ракетка Wilson",
    categorySlug: "sport",
    price: 240000,
    condition: ProductCondition.LIKE_NEW,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Чингэлтэй",
    daysAgo: 4,
    description:
      "Wilson Pro Staff теннис ракетка.\n\nШинэ стрингтэй, хамтад нь цүнх өгнө.\n\n10-р сарын эхээр ашигласан.",
    specs: {
      Төрөл: "Pro Staff",
      Жин: "300g",
    },
    imageCount: 1,
  },
  {
    name: "Иогийн хивс 50мм",
    categorySlug: "sport",
    price: 110000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Баянгол",
    daysAgo: 2,
    description:
      "50 мм зузаан иогийн хивс.\n\nНурууны дасгал хийхэд зөөлөн.\n\nБэлэг болгон силикон резинка өгнө.",
    specs: {
      Зузаан: "50mm",
      Хэмжээ: "185x80 cm",
    },
    imageCount: 1,
  },
  {
    name: "Номын тавиур 4 давхар",
    categorySlug: "busad",
    price: 220000,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Хан-Уул",
    daysAgo: 7,
    description:
      "4 давхар номын тавиур.\n\nНом, бичиг баримт эрэмбэлэхэд тохиромжтой.\n\nГэрийн хэрэглээнд ашигласан.",
    specs: {
      Давхар: "4",
    },
    imageCount: 2,
  },
  {
    name: "A4 хурууны тоолуур",
    categorySlug: "busad",
    price: 30000,
    condition: ProductCondition.NEW,
    status: ProductStatus.AVAILABLE,
    location: "УБ, Сүхбаатар",
    daysAgo: 1,
    description:
      "A4 хэлбэрийн цаасны тоолуур, шинэ.\n\nХэвлэл, бичиг баримтаа хялбар эрэмбэлэхэд тусална.",
    specs: {
      Хэлбэр: "A4",
    },
    imageCount: 1,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: category.sortOrder,
        imageUrl: pic(category.slug, 1),
      },
    });
  }
  console.log(`Categories: ${CATEGORIES.length}`);

  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Admin",
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email,
      name: "Admin",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  if (!process.env.ADMIN_PASSWORD) {
    console.log(
      `\nADMIN_PASSWORD env биш — сэнэгдсэн нууц үг: ${password}\nАдмин имэйл: ${email}\n`
    );
  } else {
    console.log(`Admin user ready: ${email}`);
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      ownerName: "Бат-Эрдэнэ",
      siteTitle: "Geomax",
      siteTagline: "Сонгож үзээд, шууд холбогдоорой.",
      phone: "+976 9911 2233",
      facebookUrl: "https://facebook.com/",
      messengerUrl: "https://m.me/",
      location: "Улаанбаатар хот",
      bio: "Сайн чанарын, хямд үнэтэй бараагаа зарж байна.\n\nЯмар нэгэн асуулт байвал холбогдож болно.",
    },
  });

  for (const product of PRODUCTS) {
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
    });
    if (!category) {
      console.warn(`Category not found: ${product.categorySlug}`);
      continue;
    }

    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { status: product.status },
      });
      continue;
    }

    const slug = slugifyProduct(product.name);
    const data: Prisma.ProductCreateInput = {
      name: product.name,
      slug,
      description: product.description,
      price: product.price,
      condition: product.condition,
      status: product.status,
      location: product.location,
      featured: product.featured ?? false,
      specs: product.specs,
      category: { connect: { id: category.id } },
      createdAt: new Date(Date.now() - product.daysAgo * 24 * 60 * 60 * 1000),
      images: {
        create: Array.from({ length: product.imageCount }, (_, index) => ({
          url: pic(product.name, index + 1),
          alt: `${product.name} — ${index + 1}-р зураг`,
          sortOrder: index,
        })),
      },
    };

    await prisma.product.create({ data });
  }

  const created = await prisma.product.count();
  console.log(`Products: ${created}`);

  console.log("Seeding complete.");
}

let counter = 0;
function generatePassword() {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 12; i += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

function slugifyProduct(name: string) {
  const translit: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "io", ж: "j",
    з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
    ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f",
    х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ы: "y", ь: "",
    э: "e", ю: "yu", я: "ya",
  };
  const raw = name.toLowerCase().replace(/["'`]/g, "");
  const slug = raw
    .split("")
    .map((char) => translit[char] ?? (char.match(/[a-z0-9]/) ? char : "-"))
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  counter += 1;
  const unique = `${slug || "product"}-${counter}`;
  return unique;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });