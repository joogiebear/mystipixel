export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  // Check if user is admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Admin access required'
    });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        emailVerified: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            resources: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      users
    };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch users'
    });
  }
});
