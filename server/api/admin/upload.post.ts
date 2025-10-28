import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomBytes } from 'crypto';

// Generate a random filename
const generateRandomFilename = (extension: string): string => {
  const randomString = randomBytes(16).toString('hex');
  return `${randomString}.${extension}`;
};

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = await getUserSession(event);
  if (!session?.user || session.user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    });
  }

  try {
    const formData = await readMultipartFormData(event);

    if (!formData) {
      throw createError({
        statusCode: 400,
        message: 'No form data provided'
      });
    }

    // Extract form fields
    const fields: Record<string, string> = {};
    const files: { zip?: any; images: any[] } = { images: [] };

    for (const part of formData) {
      if (part.name?.startsWith('image_')) {
        files.images.push(part);
      } else if (part.name === 'zipFile') {
        files.zip = part;
      } else if (part.name && part.data) {
        fields[part.name] = part.data.toString('utf-8');
      }
    }

    // Validate required fields
    if (!fields.title || !fields.description || !fields.content || !files.zip) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields'
      });
    }

    // Generate slug from title (used only for the markdown filename)
    const slug = fields.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure directories exist
    const publicDir = join(process.cwd(), 'public');
    const downloadsDir = join(publicDir, 'downloads');
    const imagesDir = join(publicDir, 'images', 'items');
    const contentDir = join(process.cwd(), 'content', 'downloads');

    for (const dir of [downloadsDir, imagesDir, contentDir]) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }

    // Save zip file with random filename
    const zipFileName = generateRandomFilename('zip');
    const zipPath = join(downloadsDir, zipFileName);
    await writeFile(zipPath, files.zip.data);

    // Save images with random filenames and build image paths array
    const imagePaths: string[] = [];
    for (const image of files.images) {
      const ext = image.filename?.split('.').pop() || 'png';
      const imageFileName = generateRandomFilename(ext);
      const imagePath = join(imagesDir, imageFileName);
      await writeFile(imagePath, image.data);
      imagePaths.push(`/images/items/${imageFileName}`);
    }

    // Build markdown frontmatter
    const frontmatter: Record<string, any> = {
      title: fields.title,
      description: fields.description,
      pluginType: fields.pluginType,
      downloadUrl: `/downloads/${zipFileName}`,
      version: fields.version || '1.0.0'
    };

    if (fields.category) {
      frontmatter.category = fields.category;
    }

    if (fields.fileSize) {
      frontmatter.fileSize = fields.fileSize;
    }

    if (imagePaths.length > 0) {
      frontmatter.images = imagePaths;
    }

    // Build markdown content
    let markdownContent = '---\n';
    for (const [key, value] of Object.entries(frontmatter)) {
      if (Array.isArray(value)) {
        markdownContent += `${key}:\n`;
        for (const item of value) {
          markdownContent += `  - ${item}\n`;
        }
      } else {
        markdownContent += `${key}: ${value}\n`;
      }
    }
    markdownContent += '---\n\n';
    markdownContent += fields.content;

    // Save markdown file
    const markdownPath = join(contentDir, `${slug}.md`);
    await writeFile(markdownPath, markdownContent, 'utf-8');

    return {
      success: true,
      slug,
      message: 'Item uploaded successfully'
    };

  } catch (error: any) {
    console.error('Upload error:', error);
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to upload item'
    });
  }
});
