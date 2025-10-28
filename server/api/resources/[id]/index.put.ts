import { validateResourceTitle, validateResourceDescription } from '../../../utils/contentFilter';

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

  const body = await readBody(event);
  const { title, description, pluginType, category, content } = body;

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

    // Check permissions
    const isOwner = session.user.id === resource.userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to edit this resource'
      });
    }

    // Validate title if provided
    if (title) {
      const titleValidation = validateResourceTitle(title);
      if (!titleValidation.valid) {
        throw createError({
          statusCode: 400,
          message: titleValidation.error
        });
      }
    }

    // Validate description if provided
    if (description) {
      const descriptionValidation = validateResourceDescription(description);
      if (!descriptionValidation.valid) {
        throw createError({
          statusCode: 400,
          message: descriptionValidation.error
        });
      }
    }

    // Update resource
    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(pluginType && { pluginType }),
        ...(category !== undefined && { category: category || null }),
        ...(content && { content })
      },
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
          take: 1
        }
      }
    });

    return {
      success: true,
      resource: updatedResource
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error updating resource:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to update resource'
    });
  }
});
