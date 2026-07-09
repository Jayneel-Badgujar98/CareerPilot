import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

    try {
      const newUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0].emailAddress,
        },
      });
      console.log(newUser);
      return newUser;
    } catch (createError) {
      // If concurrent request created the user in the meantime, try fetching it again
      if (createError.code === "P2002") {
        const retryUser = await db.user.findUnique({
          where: {
            clerkUserId: user.id,
          },
        });
        if (retryUser) return retryUser;
      }
      throw createError;
    }
  } catch (error) {
    console.log("Error in checkUser:", error.message);
    // If we throw here, it's safer, but to match original signature, we return checkUser fallback
    const fallbackUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });
    if (fallbackUser) return fallbackUser;
    return null;
  }
};
