export default defineEventHandler(async (event) => {
  const resourceId = getRouterParam(event, 'id');

  if (!resourceId) {
    throw createError({
      statusCode: 400,
      message: 'Resource ID is required'
    });
  }

  try {
    // Get the resource to check if it exists and permissions
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
        message: 'Resource not found'
      });
    }

    // Check access permissions
    const session = await getUserSession(event);
    const isOwner = session?.user?.id === resource.userId;
    const isAdmin = session?.user?.role === 'ADMIN';
    const isPublic = resource.isApproved && resource.isVisible;

    if (!isPublic && !isOwner && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to view this resource'
      });
    }

    // Get all versions
    const versions = await prisma.resourceVersion.findMany({
      where: { resourceId },
      orderBy: { createdAt: 'desc' }
    });

    // Transform imageUrls from JSON string to array
    const transformedVersions = versions.map(version => ({
      ...version,
      imageUrls: version.imageUrls ? JSON.parse(version.imageUrls) : []
    }));

    return {
      success: true,
      versions: transformedVersions
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching versions:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch version history'
    });
  }
});
