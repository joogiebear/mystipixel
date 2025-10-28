import { readMultipartFormData } from 'h3';
import { randomBytes } from 'crypto';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

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
      where: { id: resourceId },
      include: {
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

    // Check permissions
    const isOwner = session.user.id === resource.userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to add versions to this resource'
      });
    }

    // Parse multipart form data
    const formData = await readMultipartFormData(event);

    if (!formData) {
      throw createError({
        statusCode: 400,
        message: 'No form data provided'
      });
    }

    // Extract fields
    let version = '';
    let changelog = '';
    let zipFile: { filename: string; data: Buffer } | null = null;
    const imageFiles: { filename: string; data: Buffer }[] = [];

    for (const part of formData) {
      if (part.name === 'version') version = part.data.toString('utf-8');
      else if (part.name === 'changelog') changelog = part.data.toString('utf-8');
      else if (part.name === 'zip' && part.filename) {
        zipFile = { filename: part.filename, data: part.data };
      } else if (part.name === 'images' && part.filename) {
        imageFiles.push({ filename: part.filename, data: part.data });
      }
    }

    // Validate required fields
    if (!version || !zipFile) {
      throw createError({
        statusCode: 400,
        message: 'Version number and ZIP file are required'
      });
    }

    // Validate ZIP file
    if (zipFile.data.length > 50 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        message: 'ZIP file must be less than 50MB'
      });
    }

    if (!zipFile.filename.toLowerCase().endsWith('.zip')) {
      throw createError({
        statusCode: 400,
        message: 'File must be a ZIP archive'
      });
    }

    // Validate image files
    for (const image of imageFiles) {
      if (image.data.length > 5 * 1024 * 1024) {
        throw createError({
          statusCode: 400,
          message: `Image ${image.filename} must be less than 5MB`
        });
      }

      const ext = image.filename.toLowerCase();
      if (!ext.endsWith('.png') && !ext.endsWith('.jpg') && !ext.endsWith('.jpeg') && !ext.endsWith('.webp')) {
        throw createError({
          statusCode: 400,
          message: `Image ${image.filename} must be PNG, JPG, JPEG, or WebP`
        });
      }
    }

    // Generate random filenames
    const zipFilename = `${randomBytes(16).toString('hex')}.zip`;
    const imageFilenames: string[] = [];

    // Save ZIP file
    const downloadsDir = join(process.cwd(), 'public', 'downloads');
    await mkdir(downloadsDir, { recursive: true });
    await writeFile(join(downloadsDir, zipFilename), zipFile.data);

    // Save image files
    if (imageFiles.length > 0) {
      const imagesDir = join(process.cwd(), 'public', 'images', 'items');
      await mkdir(imagesDir, { recursive: true });

      for (const image of imageFiles) {
        const ext = image.filename.split('.').pop();
        const imageFilename = `${randomBytes(16).toString('hex')}.${ext}`;
        await writeFile(join(imagesDir, imageFilename), image.data);
        imageFilenames.push(imageFilename);
      }
    }

    // Calculate file size
    const fileSize = formatFileSize(zipFile.data.length);

    // Create new version
    const newVersion = await prisma.resourceVersion.create({
      data: {
        resourceId: resource.id,
        version,
        changelog: changelog || 'No changelog provided',
        zipUrl: `/downloads/${zipFilename}`,
        imageUrls: imageFilenames.length > 0
          ? JSON.stringify(imageFilenames.map(f => `/images/items/${f}`))
          : null,
        fileSize
      }
    });

    // Update resource current version
    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        currentVersion: version
      }
    });

    // Keep only last 10 versions, delete older ones
    const allVersions = await prisma.resourceVersion.findMany({
      where: { resourceId: resource.id },
      orderBy: { createdAt: 'desc' }
    });

    if (allVersions.length > 10) {
      const versionsToDelete = allVersions.slice(10);

      for (const oldVersion of versionsToDelete) {
        // Delete files from disk
        try {
          const zipPath = join(process.cwd(), 'public', oldVersion.zipUrl);
          await unlink(zipPath);

          if (oldVersion.imageUrls) {
            const imageUrls = JSON.parse(oldVersion.imageUrls);
            for (const imageUrl of imageUrls) {
              const imagePath = join(process.cwd(), 'public', imageUrl);
              await unlink(imagePath);
            }
          }
        } catch (err) {
          console.error('Error deleting old version files:', err);
          // Continue even if file deletion fails
        }

        // Delete version from database
        await prisma.resourceVersion.delete({
          where: { id: oldVersion.id }
        });
      }
    }

    return {
      success: true,
      version: newVersion,
      message: 'New version created successfully'
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error creating version:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to create new version'
    });
  }
});

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
