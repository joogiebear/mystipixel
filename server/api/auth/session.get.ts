export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    return {
      user: null,
      authenticated: false
    };
  }

  // Get fresh user data from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      emailVerified: true,
      isBanned: true,
      createdAt: true
    }
  });

  if (!user || user.isBanned) {
    // Clear session if user is banned or deleted
    await clearUserSession(event);
    return {
      user: null,
      authenticated: false
    };
  }

  return {
    user,
    authenticated: true
  };
});
