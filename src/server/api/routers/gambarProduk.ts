// 2. Create tRPC router for product image operations (server/api/routers/productImage.ts)
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import cloudinary from "~/lib/cloudinary/cloudinary";
import { TRPCError } from "@trpc/server";

export const productImageRouter = createTRPCRouter({
  // Upload a new image for a product
  uploadImage: protectedProcedure
    .input(
      z.object({
        produkId: z.number(),
        imageBase64: z.string(),
        fileName: z.string(),
        isMain: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // If this is set as main image, set all other images as not main
        if (input.isMain) {
          await ctx.prisma.gambarProduk.updateMany({
            where: { produkId: input.produkId },
            data: { utama: false },
          });
        }

        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(
          input.imageBase64,
          {
            folder: "products",
            filename_override: input.fileName,
          },
        );

        // Save image reference to database
        const newImage = await ctx.prisma.gambarProduk.create({
          data: {
            produkId: input.produkId,
            urlGambar: uploadResult.secure_url,
            idPublikGambar: uploadResult.public_id,
            namaFileGambar: input.fileName,
            utama: input.isMain,
            // diunggahPada will use default(now())
          },
        });

        return newImage;
      } catch (error) {
        console.error("Failed to upload image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
        });
      }
    }),

  // Delete an image from Cloudinary and database
  deleteImage: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        // Get image details from database
        const image = await ctx.prisma.gambarProduk.findUnique({
          where: { id: input },
        });

        if (!image) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found",
          });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(image.idPublikGambar);

        // Delete from database
        await ctx.prisma.gambarProduk.delete({
          where: { id: input },
        });

        return { success: true };
      } catch (error) {
        console.error("Failed to delete image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete image",
        });
      }
    }),

  // Update/Replace an image
  updateImage: protectedProcedure
    .input(
      z.object({
        imageId: z.number(),
        imageBase64: z.string(),
        fileName: z.string().optional(),
        isMain: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Find the existing image
        const existingImage = await ctx.prisma.gambarProduk.findUnique({
          where: { id: input.imageId },
        });

        if (!existingImage) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found",
          });
        }

        // If setting as main image, update all other images for this product
        if (input.isMain) {
          await ctx.prisma.gambarProduk.updateMany({
            where: {
              produkId: existingImage.produkId,
              id: { not: input.imageId },
            },
            data: { utama: false },
          });
        }

        // Delete existing image from Cloudinary
        await cloudinary.uploader.destroy(existingImage.idPublikGambar);

        // Upload new image
        const uploadResult = await cloudinary.uploader.upload(
          input.imageBase64,
          {
            folder: "products",
            filename_override: input.fileName || existingImage.namaFileGambar,
          },
        );

        // Update database record
        const updatedImage = await ctx.prisma.gambarProduk.update({
          where: { id: input.imageId },
          data: {
            urlGambar: uploadResult.secure_url,
            idPublikGambar: uploadResult.public_id,
            namaFileGambar: input.fileName || existingImage.namaFileGambar,
            ...(input.isMain !== undefined ? { utama: input.isMain } : {}),
          },
        });

        return updatedImage;
      } catch (error) {
        console.error("Failed to update image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update image",
        });
      }
    }),

  // Set an image as the main image
  setMainImage: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        // Find the image
        const image = await ctx.prisma.gambarProduk.findUnique({
          where: { id: input },
          select: { id: true, produkId: true },
        });

        if (!image) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found",
          });
        }

        // Update all images for this product
        await ctx.prisma.gambarProduk.updateMany({
          where: { produkId: image.produkId },
          data: { utama: false },
        });

        // Set selected image as main
        await ctx.prisma.gambarProduk.update({
          where: { id: input },
          data: { utama: true },
        });

        return { success: true };
      } catch (error) {
        console.error("Failed to set main image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set main image",
        });
      }
    }),

  // Get all images for a product
  getProductImages: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.gambarProduk.findMany({
        where: { produkId: input },
        orderBy: [{ utama: "desc" }, { diunggahPada: "desc" }],
      });
    }),
});
