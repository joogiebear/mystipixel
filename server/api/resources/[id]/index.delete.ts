export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const resourceId = getRouterParam(event, 'id');

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'You must be logged in'
    });
  }

  if (!resourceId) {
    throw createError({
      statusCode: 400,
      message: 'Resource ID is required'
    });
  }

  try {
    // Get the resource
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    });

    if (!resource) {
      throw createError({
        statusCode: 404,
        message: 'Resource not found'
      });
    }

    if (resource.deletedAt) {
      throw createError({
        statusCode: 404,
        message: 'Resource already deleted'
      });
    }

    // Check permissions
    const isOwner = session.user.id === resource.userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to delete this resource'
      });
    }

    // Soft delete (set deletedAt timestamp)
    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        deletedAt: new Date()
      }
    });

    return {
      success: true,
      message: 'Resource deleted successfully'
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error deleting resource:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to delete resource'
    });
  }
});
