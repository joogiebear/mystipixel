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

    // Check permissions (only owner can toggle visibility)
    if (session.user.id !== resource.userId) {
      throw createError({
        statusCode: 403,
        message: 'Only the resource owner can toggle visibility'
      });
    }

    // Toggle visibility
    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        isVisible: !resource.isVisible
      }
    });

    return {
      success: true,
      isVisible: updatedResource.isVisible,
      message: `Resource is now ${updatedResource.isVisible ? 'visible' : 'hidden'}`
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error toggling visibility:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to toggle visibility'
    });
  }
});
