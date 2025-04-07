// src/server/api/routers/auth.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { PeranPengguna } from "@prisma/client";
import { supabase } from "~/lib/supabase/client";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        nama: z.string().min(2),
        peran: z.nativeEnum(PeranPengguna).default("Admin_Produksi"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.nama,
          },
        },
      });

      if (authError || !authData.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: authError?.message || "Failed to create account",
        });
      }

      // Create user in our database
      const user = await ctx.db.pengguna.create({
        data: {
          auth_id: authData.user.id,
          nama: input.nama,
          email: input.email,
          peran: input.peran,
        },
      });

      return { success: true, user };
    }),

  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error || !data.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error?.message || "Invalid login credentials",
        });
      }

      // Find or create the user in our database
      let user = await ctx.db.pengguna.findUnique({
        where: { auth_id: data.user.id },
      });

      if (!user) {
        // Create the user if they don't exist yet
        user = await ctx.db.pengguna.create({
          data: {
            auth_id: data.user.id,
            nama: data.user.user_metadata.full_name || "User",
            email: data.user.email!,
            peran: "Admin_Produksi", // Default role
          },
        });
      }

      // Create a new session
      const userAgent = ctx.headers.get("user-agent");
      const ipAddress = ctx.headers.get("x-forwarded-for") || "unknown";

      const session = await ctx.db.session.create({
        data: {
          pengguna_id: user.auth_id,
          user_agent: userAgent || undefined,
          ip_address: ipAddress || undefined,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Update last seen timestamp
      await ctx.db.pengguna.update({
        where: { auth_id: user.auth_id },
        data: { last_seen: new Date() },
      });

      return {
        token: data.session?.access_token,
        user,
        sessionId: session.id,
      };
    }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    // Remove the session from the database
    if (ctx.session) {
      await ctx.db.session.delete({
        where: { id: ctx.session.id },
      });
    }

    // Sign out from Supabase
    await supabase.auth.signOut();

    return { success: true };
  }),

  getUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const user = await ctx.db.pengguna.findUnique({
      where: { auth_id: ctx.user.id },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  updateUser: protectedProcedure
    .input(
      z.object({
        nama: z.string().min(2).optional(),
        peran: z.nativeEnum(PeranPengguna).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const user = await ctx.db.pengguna.update({
        where: { auth_id: ctx.user.id },
        data: input,
      });

      return user;
    }),
});
