export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const userId = getRouterParam(event, 'id');

  // Check if user is admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Admin access required'
    });
  }

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required'
    });
  }

  // Prevent self-ban
  if (userId === session.user.id) {
    throw createError({
      statusCode: 400,
      message: 'You cannot ban yourself'
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      });
    }

    // Prevent banning other admins
    if (user.role === 'ADMIN') {
      throw createError({
        statusCode: 400,
        message: 'Cannot ban other administrators'
      });
    }

    // Toggle ban status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: !user.isBanned
      }
    });

    return {
      success: true,
      isBanned: updatedUser.isBanned,
      message: updatedUser.isBanned ? 'User banned' : 'User unbanned'
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error toggling ban:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to toggle ban status'
    });
  }
});
