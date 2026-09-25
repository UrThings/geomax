-- AlterTable
ALTER TABLE "SiteSettings" ALTER COLUMN "ownerName" SET DEFAULT 'Geomax';

-- CreateTable
CREATE TABLE "ProductView" (
    "productId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductView_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "SiteStat" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteViews" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteStat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
