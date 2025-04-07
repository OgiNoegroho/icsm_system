// src/lib/services/auth.ts

import { supabase } from "~/lib/supabase/client";
import { prisma } from "~/server/db";
import { PeranPengguna } from "@prisma/client";

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(data: {
    email: string;
    password: string;
    nama: string;
    peran: PeranPengguna;
  }) {
    // Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.nama,
        },
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create account");
    }

    // Create user in our database
    const user = await prisma.pengguna.create({
      data: {
        auth_id: authData.user.id,
        nama: data.nama,
        email: data.email,
        peran: data.peran,
      },
    });

    return { user, session: authData.session };
  },

  /**
   * Sign in an existing user
   */
  async signIn(data: {
    email: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !authData.user) {
      throw new Error(error?.message || "Invalid login credentials");
    }

    // Find or create user in our database
    let user = await prisma.pengguna.findUnique({
      where: { auth_id: authData.user.id },
    });

    if (!user) {
      // Create user if not exists (this shouldn't happen normally)
      user = await prisma.pengguna.create({
        data: {
          auth_id: authData.user.id,
          nama: authData.user.user_metadata?.full_name || "User",
          email: authData.user.email!,
          peran: "Admin_Produksi", // Default role
        },
      });
    }

    // Create a session
    const session = await prisma.session.create({
      data: {
        pengguna_id: user.auth_id,
        user_agent: data.userAgent,
        ip_address: data.ipAddress,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Update last seen
    await prisma.pengguna.update({
      where: { auth_id: user.auth_id },
      data: { last_seen: new Date() },
    });

    // Return all necessary data
    return {
      user,
      session,
      token: authData.session?.access_token,
    };
  },

  /**
   * Sign out a user
   */
  async signOut(sessionId: string) {
    // Delete the session
    await prisma.session.delete({
      where: { id: sessionId },
    });

    // Sign out from Supabase
    await supabase.auth.signOut();

    return { success: true };
  },

  /**
   * Get current user from token
   */
  async getUserFromToken(token: string) {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    const user = await prisma.pengguna.findUnique({
      where: { auth_id: data.user.id },
    });

    return user;
  },
};
