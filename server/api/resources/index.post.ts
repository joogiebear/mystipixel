import { readMultipartFormData } from 'h3';
import { randomBytes } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { validateResourceTitle, validateResourceDescription, validateZipFile } from '../../utils/contentFilter';

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'You must be logged in to upload resources'
    });
  }

  // Get user from database to check verification status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    });
  }

  if (!user.emailVerified) {
    throw createError({
      statusCode: 403,
      message: 'Please verify your email before uploading resources'
    });
  }

  if (user.isBanned) {
    throw createError({
      statusCode: 403,
      message: 'Your account has been banned'
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
  let title = '';
  let description = '';
  let pluginType = '';
  let category = '';
  let content = '';
  let version = '';
  let changelog = '';
  let zipFile: { filename: string; data: Buffer } | null = null;
  const imageFiles: { filename: string; data: Buffer }[] = [];

  for (const part of formData) {
    if (part.name === 'title') title = part.data.toString('utf-8');
    else if (part.name === 'description') description = part.data.toString('utf-8');
    else if (part.name === 'pluginType') pluginType = part.data.toString('utf-8');
    else if (part.name === 'category') category = part.data.toString('utf-8');
    else if (part.name === 'content') content = part.data.toString('utf-8');
    else if (part.name === 'version') version = part.data.toString('utf-8');
    else if (part.name === 'changelog') changelog = part.data.toString('utf-8');
    else if (part.name === 'zip' && part.filename) {
      zipFile = { filename: part.filename, data: part.data };
    } else if (part.name === 'images' && part.filename) {
      imageFiles.push({ filename: part.filename, data: part.data });
    }
  }

  // Validate required fields
  if (!title || !description || !pluginType || !content || !version || !zipFile) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields: title, description, pluginType, content, version, and zip file are required'
    });
  }

  // Validate title
  const titleValidation = validateResourceTitle(title);
  if (!titleValidation.valid) {
    throw createError({
      statusCode: 400,
      message: titleValidation.error
    });
  }

  // Validate description
  const descriptionValidation = validateResourceDescription(description);
  if (!descriptionValidation.valid) {
    throw createError({
      statusCode: 400,
      message: descriptionValidation.error
    });
  }

  // Validate ZIP file size (50MB max)
  if (zipFile.data.length > 50 * 1024 * 1024) {
    throw createError({
      statusCode: 400,
      message: 'ZIP file must be less than 50MB'
    });
  }

  // Validate ZIP file extension
  if (!zipFile.filename.toLowerCase().endsWith('.zip')) {
    throw createError({
      statusCode: 400,
      message: 'File must be a ZIP archive'
    });
  }

  // Validate image files (5MB max each)
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

  try {
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

    // Calculate file size in human-readable format
    const fileSize = formatFileSize(zipFile.data.length);

    // Create resource and version in database
    const resource = await prisma.resource.create({
      data: {
        userId: user.id,
        title,
        description,
        pluginType,
        category: category || null,
        content,
        currentVersion: version,
        isVisible: true,
        isApproved: false, // Requires admin approval
        versions: {
          create: {
            version,
            changelog: changelog || 'Initial release',
            zipUrl: `/downloads/${zipFilename}`,
            imageUrls: imageFilenames.length > 0
              ? JSON.stringify(imageFilenames.map(f => `/images/items/${f}`))
              : null,
            fileSize
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        versions: true
      }
    });

    return {
      success: true,
      resource
    };
  } catch (error: any) {
    console.error('Error creating resource:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to create resource. Please try again.'
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
