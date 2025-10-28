export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  // Check if user is admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'Admin access required'
    });
  }

  const query = getQuery(event);

  // Build where clause
  const whereClause: any = {};

  // Filter by approval status
  if (query.approved === 'true') {
    whereClause.isApproved = true;
  } else if (query.approved === 'false') {
    whereClause.isApproved = false;
  }

  // Filter by visibility
  if (query.visible === 'true') {
    whereClause.isVisible = true;
  } else if (query.visible === 'false') {
    whereClause.isVisible = false;
  }

  // Include or exclude deleted
  if (query.includeDeleted !== 'true') {
    whereClause.deletedAt = null;
  }

  try {
    const resources = await prisma.resource.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            emailVerified: true,
            isBanned: true
          }
        },
        versions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
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

    return {
      success: true,
      resources
    };
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch resources'
    });
  }
});
