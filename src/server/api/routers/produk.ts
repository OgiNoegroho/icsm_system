// server/api/routers/product.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Create a Zod schema for product input validation
const productInputSchema = z.object({
  nama: z.string().min(1, { message: "Nama produk tidak boleh kosong" }),
  kategori: z.string().nullable(),
  komposisi: z.string().nullable(),
  deskripsi: z.string().nullable(),
  harga: z.number().positive({ message: "Harga harus bernilai positif" }),
});

// Create a schema for product updates
const productUpdateSchema = productInputSchema.partial();

export const productRouter = createTRPCRouter({
  // Get all products
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
        cursor: z.number().optional(), // for pagination
        search: z.string().optional(),
        kategori: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, kategori } = input;

      const products = await ctx.prisma.produk.findMany({
        take: limit + 1, // fetch one more for next cursor
        where: {
          ...(search
            ? {
                OR: [
                  { nama: { contains: search, mode: "insensitive" } },
                  { deskripsi: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(kategori ? { kategori } : {}),
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { id: "desc" },
        include: {
          gambarProduk: {
            where: { utama: true },
            take: 1,
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: products,
        nextCursor,
      };
    }),

  // Get product by ID
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.produk.findUnique({
        where: { id: input },
        include: {
          gambarProduk: {
            orderBy: [{ utama: "desc" }, { diunggahPada: "desc" }],
          },
          batch: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produk tidak ditemukan",
        });
      }

      return product;
    }),

  // Create product
  create: protectedProcedure
    .input(productInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Convert input.harga from number to Decimal
        const product = await ctx.prisma.produk.create({
          data: {
            nama: input.nama,
            kategori: input.kategori,
            komposisi: input.komposisi,
            deskripsi: input.deskripsi,
            harga: input.harga.toString(), // Convert to string for Decimal type
          },
        });

        return product;
      } catch (error) {
        console.error("Failed to create product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal membuat produk",
        });
      }
    }),

  // Update product
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: productUpdateSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, data } = input;

        // Check if product exists
        const exists = await ctx.prisma.produk.findUnique({
          where: { id },
        });

        if (!exists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Produk tidak ditemukan",
          });
        }

        // Update the product
        const product = await ctx.prisma.produk.update({
          where: { id },
          data: {
            ...data,
            ...(data.harga ? { harga: data.harga.toString() } : {}), // Convert to string for Decimal
          },
        });

        return product;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Failed to update product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal memperbarui produk",
        });
      }
    }),

  // Delete product
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if product exists
        const product = await ctx.prisma.produk.findUnique({
          where: { id: input },
          include: { gambarProduk: true },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Produk tidak ditemukan",
          });
        }

        // If there are images associated, delete them from Cloudinary first
        if (product.gambarProduk.length > 0) {
          const cloudinary = (await import("@/lib/cloudinary")).default;

          for (const image of product.gambarProduk) {
            await cloudinary.uploader.destroy(image.idPublikGambar);
          }
        }

        // Delete the product (this will cascade delete the images from DB)
        await ctx.prisma.produk.delete({
          where: { id: input },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Failed to delete product:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal menghapus produk",
        });
      }
    }),

  // Get product categories for filtering
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.produk.findMany({
      select: { kategori: true },
      where: { kategori: { not: null } },
      distinct: ["kategori"],
    });

    return categories
      .map((item) => item.kategori)
      .filter((category): category is string => category !== null);
  }),
});
