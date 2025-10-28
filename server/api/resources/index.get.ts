export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const session = await getUserSession(event);

  // Build where clause based on user role
  const whereClause: any = {
    deletedAt: null // Only non-deleted resources
  };

  // If user is not an admin, only show approved and visible resources
  // If user is logged in, also show their own resources regardless of approval
  if (!session?.user || session.user.role !== 'ADMIN') {
    if (session?.user) {
      // Logged in user: show approved+visible OR own resources
      whereClause.OR = [
        { isApproved: true, isVisible: true },
        { userId: session.user.id }
      ];
    } else {
      // Public: only show approved and visible
      whereClause.isApproved = true;
      whereClause.isVisible = true;
    }
  }

  // Filter by plugin type
  if (query.pluginType && query.pluginType !== 'All') {
    whereClause.pluginType = query.pluginType as string;
  }

  // Filter by category
  if (query.category && query.category !== 'All') {
    whereClause.category = query.category as string;
  }

  // Search query
  if (query.search) {
    const searchTerm = (query.search as string).toLowerCase();
    whereClause.OR = [
      ...(whereClause.OR || []),
      {
        title: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      {
        description: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    ];
  }

  try {
    const resources = await prisma.resource.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        versions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Only get the latest version
        },
        _count: {
          select: {
            versions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data for frontend
    const transformedResources = resources.map(resource => ({
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
      latestVersion: resource.versions[0] || null,
      versionCount: resource._count.versions
    }));

    return {
      success: true,
      resources: transformedResources
    };
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch resources'
    });
  }
});
