
import { PrismaClient } from "@prisma/client";
import { supabase } from "~/lib/supabase/client";

const prisma = new PrismaClient();

export const createTRPCContext = async (opts: {
  req?: Request;
  headers: Headers;
}) => {
  // For API routes we need to get the req from opts
  const req = opts?.req;
  const headers = opts?.headers;

  // Get the Supabase auth token from the request headers
  const authHeader = headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  let user = null;
  let session = null;

  if (token) {
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (!error && data?.user) {
      user = data.user;

      // Find user in the database
      const dbUser = await prisma.pengguna.findUnique({
        where: { auth_id: user.id },
      });

      if (dbUser) {
        // Find or create session
        const userAgent = headers.get("user-agent");

        // In a Next.js App Router setup, we need to handle cookies differently
        let sessionId = null;
        if (req) {
          // Try to get the cookie
          const cookieHeader = headers.get("cookie");
          const sessionCookie = cookieHeader
            ?.split(";")
            .find((c) => c.trim().startsWith("session_id="));
          sessionId = sessionCookie?.split("=")[1];
        }

        if (sessionId) {
          // Update existing session
          session = await prisma.session.update({
            where: { id: sessionId },
            data: { last_active: new Date() },
          });
        } else {
          // Create new session
          session = await prisma.session.create({
            data: {
              pengguna_id: user.id,
              user_agent: userAgent || undefined,
              ip_address: headers.get("x-forwarded-for") || "unknown",
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
          });
        }

        // Update last seen timestamp
        await prisma.pengguna.update({
          where: { auth_id: user.id },
          data: { last_seen: new Date() },
        });
      }
    }
  }

  return {
    prisma,
    user,
    session,
    db: prisma,
  };
};
