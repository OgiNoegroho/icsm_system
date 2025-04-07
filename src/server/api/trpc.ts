/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";
import { supabase } from "~/lib/supabase/client";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
export const createTRPCContext = async (opts: {
  req?: Request;
  headers: Headers;
}) => {
  // Get the Supabase auth token from the request headers
  const authHeader = opts.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  let user = null;
  let session = null;

  if (token) {
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (!error && data?.user) {
      user = data.user;

      // Find user in the database
      const dbUser = await db.pengguna.findUnique({
        where: { auth_id: user.id },
      });

      if (dbUser) {
        // Find or create session
        const userAgent = opts.headers.get("user-agent");

        // In a Next.js App Router setup, we need to handle cookies differently
        let sessionId = null;
        if (opts.req) {
          // Try to get the cookie
          const cookieHeader = opts.headers.get("cookie");
          const sessionCookie = cookieHeader
            ?.split(";")
            .find((c) => c.trim().startsWith("session_id="));
          sessionId = sessionCookie?.split("=")[1];
        }

        if (sessionId) {
          // Update existing session
          try {
            session = await db.session.update({
              where: { id: sessionId },
              data: { last_active: new Date() },
            });
          } catch (e) {
            // Session might have expired or been deleted
            session = null;
          }
        }

        // If no valid session is found, create a new one
        if (!session) {
          session = await db.session.create({
            data: {
              pengguna_id: user.id,
              user_agent: userAgent || undefined,
              ip_address: opts.headers.get("x-forwarded-for") || "unknown",
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
          });
        }

        // Update last seen timestamp
        await db.pengguna.update({
          where: { auth_id: user.id },
          data: { last_seen: new Date() },
        });
      }
    }
  }

  return {
    db,
    user,
    session,
    headers: opts.headers,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (process.env.NODE_ENV === "development") {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected procedure - checks if the user is authenticated before proceeding
 */
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  });
});
