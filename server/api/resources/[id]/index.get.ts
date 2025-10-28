export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const resourceId = getRouterParam(event, 'id');

  if (!resourceId) {
    throw createError({
      statusCode: 400,
      message: 'Resource ID is required'
    });
  }

  try {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        versions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!resource) {
      throw createError({
        statusCode: 404,
        message: 'Resource not found'
      });
    }

    // Check if resource is deleted
    if (resource.deletedAt) {
      throw createError({
        statusCode: 404,
        message: 'Resource not found'
      });
    }

    // Check access permissions
    const isOwner = session?.user?.id === resource.userId;
    const isAdmin = session?.user?.role === 'ADMIN';
    const isPublic = resource.isApproved && resource.isVisible;

    if (!isPublic && !isOwner && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to view this resource'
      });
    }

    return {
      success: true,
      resource: {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        pluginType: resource.pluginType,
        category: resource.category,
        content: resource.content,
        currentVersion: resource.currentVersion,
        isVisible: resource.isVisible,
        isApproved: resource.isApproved,
        downloadCount: resource.downloadCount,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
        author: resource.user.username,
        userId: resource.user.id,
        versions: resource.versions,
        canEdit: isOwner || isAdmin,
        canDelete: isOwner || isAdmin
      }
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching resource:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch resource'
    });
  }
});
