export default defineEventHandler(async (event) => {
  const resourceId = getRouterParam(event, 'id');

  if (!resourceId) {
    throw createError({
      statusCode: 400,
      message: 'Resource ID is required'
    });
  }

  try {
    // Increment download count
    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });

    return {
      success: true,
      message: 'Download tracked successfully'
    };
  } catch (error: any) {
    console.error('Error tracking download:', error);
    // Don't throw error - we don't want to prevent downloads if tracking fails
    return {
      success: false,
      message: 'Failed to track download'
    };
  }
});
