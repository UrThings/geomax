"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { assertAdmin, createSessionToken, destroySessionCookie, findUserByEmail, getRequestIp, hashPassword, setSessionCookie, verifyPassword } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";
import { categorySchema, productSchema, settingsSchema, signInSchema, type CategoryInput, type ProductInput, type SettingsInput, type SignInInput } from "@/lib/validations";
import { ProductStatus } from "@/lib/generated/prisma/enums";
import { slugify, isBlobUrl } from "@/lib/utils";

async function revalidateCatalog() {
  revalidatePath("/", "layout");
  revalidatePath("/products");
  revalidatePath("/category");
  revalidatePath("/contact");
}

async function deleteImagesFromBlob(urls: string[]) {
  const blobUrls = urls.filter(isBlobUrl);
  if (blobUrls.length === 0 || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(blobUrls);
  } catch {
    // Deleting is best-effort; the DB record is already going away.
  }
}

export async function loginAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Буруу мэдээлэл." };
  }

  const input: SignInInput = parsed.data;
  const ip = await getRequestIp();
  if (isRateLimited(`login:${ip}:${input.email.toLowerCase()}`)) {
    return { error: "Хэт олон оролдлого хийлээ. Түр хүлээнэ үү." };
  }

  const user = await findUserByEmail(input.email.toLowerCase());
  if (!user) {
    return { error: "Имэйл эсвэл нууц үг буруу байна." };
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    return { error: "Имэйл эсвэл нууц үг буруу байна." };
  }

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  await setSessionCookie(token);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySessionCookie();
  redirect("/admin/login");
}

export async function createProductAction(input: ProductInput) {
  await assertAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Өгөгдөл буруу байна." };
  }

  const data = parsed.data;
  const baseSlug = (data.slug || slugify(data.name) || "product").slice(0, 56);
  const uid = crypto.randomUUID().slice(0, 6);
  const slug = await ensureUniqueSlug(`${baseSlug}-${uid}`);

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      condition: data.condition,
      status: data.status,
      location: data.location || null,
      featured: data.featured,
      phone: data.phone,
      facebookUrl: data.facebookUrl,
      messengerUrl: data.messengerUrl,
      specs: data.specs ?? undefined,
      categoryId: data.categoryId,
      images: {
        create: data.images.map((image, index) => ({
          url: image.url,
          alt: image.alt || null,
          sortOrder: index,
        })),
      },
    },
  });

  await revalidateCatalog();
  redirect(`/admin/products?created=${product.id}`);
}

export async function updateProductAction(id: string, input: ProductInput) {
  await assertAdmin();

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Бараа олдсонгүй." };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Өгөгдөл буруу байна." };
  }

  const data = parsed.data;
  const baseSlug =
    (data.slug || existing.slug || slugify(data.name) || "product").slice(0, 80);
  const slug = await ensureUniqueSlug(baseSlug, id);

  const existingImages = await prisma.productImage.findMany({
    where: { productId: id },
  });

  const incomingKeys = new Set(data.images.map((image) => image.url));
  const removedImages = existingImages.filter(
    (image) => !incomingKeys.has(image.url)
  );

  await deleteImagesFromBlob(removedImages.map((image) => image.url));

  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { id: { in: removedImages.map((i) => i.id) } } });
    await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        condition: data.condition,
        status: data.status,
        location: data.location || null,
        featured: data.featured,
        phone: data.phone,
        facebookUrl: data.facebookUrl,
        messengerUrl: data.messengerUrl,
        specs: data.specs ?? undefined,
        categoryId: data.categoryId,
      },
    });
    for (const [index, image] of data.images.entries()) {
      const found = existingImages.find((existingImage) => existingImage.url === image.url);
      if (found) {
        if (found.sortOrder !== index) {
          await tx.productImage.update({
            where: { id: found.id },
            data: { sortOrder: index, alt: image.alt || null },
          });
        }
      } else {
        await tx.productImage.create({
          data: {
            url: image.url,
            alt: image.alt || null,
            sortOrder: index,
            productId: id,
          },
        });
      }
    }
  });

  await revalidateCatalog();
  redirect(`/admin/products?updated=${id}`);
}

export async function deleteProductAction(id: string) {
  await assertAdmin();

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!product) {
    return { error: "Бараа олдсонгүй." };
  }

  await deleteImagesFromBlob(product.images.map((image) => image.url));
  await prisma.product.delete({ where: { id } });

  await revalidateCatalog();
  revalidatePath("/admin/products");
}

export async function setProductStatusAction(id: string, status: ProductStatus) {
  await assertAdmin();

  await prisma.product.update({ where: { id }, data: { status } });
  await revalidateCatalog();
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

export async function toggleProductFeaturedAction(id: string) {
  await assertAdmin();

  const product = await prisma.product.findUnique({
    where: { id },
    select: { featured: true },
  });
  if (!product) return { error: "Бараа олдсонгүй." };

  await prisma.product.update({
    where: { id },
    data: { featured: !product.featured },
  });

  await revalidateCatalog();
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

export async function deleteProductImageAction(
  productId: string,
  imageId: string
) {
  await assertAdmin();

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image || image.productId !== productId) {
    return { error: "Зураг олдсонгүй." };
  }

  await deleteImagesFromBlob([image.url]);
  await prisma.productImage.delete({ where: { id: imageId } });

  revalidatePath(`/admin/products/${productId}/edit`);
  await revalidateCatalog();
}

export async function createCategoryAction(input: CategoryInput) {
  await assertAdmin();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Өгөгдөл буруу байна." };
  }

  const data = parsed.data;
  const slug = await ensureUniqueCategorySlug(
    (data.slug || slugify(data.name) || "category").slice(0, 80)
  );

  await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      imageUrl: data.imageUrl,
      sortOrder: data.sortOrder,
    },
  });

  await revalidateCatalog();
  revalidatePath("/admin/categories");
}

export async function updateCategoryAction(id: string, input: CategoryInput) {
  await assertAdmin();

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return { error: "Категори олдсонгүй." };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Өгөгдөл буруу байна." };
  }

  const data = parsed.data;
  const slug = await ensureUniqueCategorySlug(
    (data.slug || existing.slug || slugify(data.name) || "category").slice(0, 80),
    id
  );

  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      imageUrl: data.imageUrl,
      sortOrder: data.sortOrder,
    },
  });

  await revalidateCatalog();
  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(id: string) {
  await assertAdmin();

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return { error: "Категори олдсонгүй." };

  if (category._count.products > 0) {
    return {
      error: `Энэ категорид ${category._count.products} бараа байгаа тул устгах боломжгүй. Эхлээд бараануудыг өөр категорид шилжүүлнэ үү.`,
    };
  }

  await prisma.category.delete({ where: { id } });

  await revalidateCatalog();
  revalidatePath("/admin/categories");
}

export async function updateSettingsAction(input: SettingsInput) {
  await assertAdmin();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Өгөгдөл буруу байна." };
  }

  const data = parsed.data;
  const existing = await prisma.siteSettings.findFirst();

  if (existing) {
    await prisma.siteSettings.update({
      where: { id: existing.id },
      data: {
        ownerName: data.ownerName,
        siteTitle: data.siteTitle || null,
        siteTagline: data.siteTagline || null,
        phone: data.phone,
        facebookUrl: data.facebookUrl,
        messengerUrl: data.messengerUrl,
        instagramUrl: data.instagramUrl,
        email: data.email,
        location: data.location,
        bio: data.bio,
      },
    });
  } else {
    await prisma.siteSettings.create({
      data: {
        id: 1,
        ownerName: data.ownerName,
        siteTitle: data.siteTitle || null,
        siteTagline: data.siteTagline || null,
        phone: data.phone,
        facebookUrl: data.facebookUrl,
        messengerUrl: data.messengerUrl,
        instagramUrl: data.instagramUrl,
        email: data.email,
        location: data.location,
        bio: data.bio,
      },
    });
  }

  await revalidateCatalog();
}

export async function changeAdminPasswordAction(
  currentPassword: string,
  newPassword: string
) {
  const session = await assertAdmin();

  if (newPassword.length < 8) {
    return { error: "Нууц үг доод тал нь 8 тэмдэгт байх ёстой." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return { error: "Хэрэглэгч олдсонгүй." };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { error: "Одоогийн нууц үг буруу байна." };

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await destroySessionCookie();
  redirect("/admin/login");
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  const exists = await prisma.product.findUnique({ where: { slug: baseSlug } });
  if (!exists || exists.id === excludeId) return baseSlug;

  let index = 2;
  while (index < 1000) {
    const candidate = `${baseSlug}-${index}`;
    const occupied = await prisma.product.findUnique({
      where: { slug: candidate },
    });
    if (!occupied || occupied.id === excludeId) return candidate;
    index += 1;
  }
  return `${baseSlug}-${Date.now()}`;
}

async function ensureUniqueCategorySlug(baseSlug: string, excludeId?: string) {
  const exists = await prisma.category.findUnique({ where: { slug: baseSlug } });
  if (!exists || exists.id === excludeId) return baseSlug;

  let index = 2;
  while (index < 1000) {
    const candidate = `${baseSlug}-${index}`;
    const occupied = await prisma.category.findUnique({
      where: { slug: candidate },
    });
    if (!occupied || occupied.id === excludeId) return candidate;
    index += 1;
  }
  return `${baseSlug}-${Date.now()}`;
}