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

    // Toggle approval status
    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        isApproved: !resource.isApproved
      }
    });

    return {
      success: true,
      isApproved: updatedResource.isApproved,
      message: updatedResource.isApproved ? 'Resource approved' : 'Resource unapproved'
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error toggling approval:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to toggle approval status'
    });
  }
});
