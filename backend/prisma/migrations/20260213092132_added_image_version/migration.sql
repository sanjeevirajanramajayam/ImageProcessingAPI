-- CreateTable
CREATE TABLE "ImageVersion" (
    "id" SERIAL NOT NULL,
    "orig_image_id" INTEGER NOT NULL,
    "image_id" TEXT NOT NULL,

    CONSTRAINT "ImageVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImageVersion" ADD CONSTRAINT "ImageVersion_orig_image_id_fkey" FOREIGN KEY ("orig_image_id") REFERENCES "Images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
