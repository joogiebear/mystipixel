export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const resourceId = getRouterParam(event, 'id');

  // Check if user is admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Admin access required'
    });
  }

  if (!resourceId) {
    throw createError({
      statusCode: 400,
      message: 'Resource ID is required'
    });
  }

  try {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    });

    if (!resource) {
      throw createError({
        statusCode: 404,
        message: 'Resource not found'
      });
    }

    // Soft delete
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
