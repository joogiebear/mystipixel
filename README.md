# MystiPixel Resources

A professional resource hosting website for your Minecraft server plugin configurations. Features a sleek, modern design similar to CurseForge or SpigotMC, with secure admin-only uploads.

## Features

### Public Site
- **Professional Design**: Clean, modern resource hosting website look
- **Search & Filter**: Real-time search with plugin type and category filters
- **Resource Cards**: Professional cards with badges, stats, and metadata
- **Modal Previews**: Click any resource for detailed view with images
- **Responsive**: Works perfectly on desktop, tablet, and mobile

### Admin Features
- **Hidden Admin Panel**: No visible links - access only via direct URL
- **Easy Uploads**: Simple form to add new resources
- **Auto File Management**: Random filenames prevent conflicts
- **Template Content**: Pre-filled markdown template for consistency
- **Secure**: Password & username protected

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Admin Credentials (Optional)

Create a `.env` file in the root directory to customize credentials:

```
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
```

Default credentials:
- Username: `admin`
- Password: `Ch@r@ct3r5`

### 3. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Access Admin Panel

The admin panel is hidden from the public site. Access it directly via:

- **Login URL**: http://localhost:3000/admin/login
- **Dashboard URL**: http://localhost:3000/admin (after login)
- **Default credentials**:
  - Username: `admin`
  - Password: `Ch@r@ct3r5`

> 💡 The admin panel has no visible links on the public site for security. Only those who know the URL can access it.

## Using the Admin Panel

### Uploading a New Item

1. **Login** to the admin panel
2. **Fill out the form**:
   - **Title**: Name of your download item
   - **Description**: Short summary (shows in listing)
   - **Plugin Type**: Select from TopCollections, TopMinions, TopMinionCrafting, or RecipeBook
   - **Category**: Required for Collections, Minions, and Crafting (e.g., "Farming", "Mining", "Combat")
   - **Version**: Version number (optional)
   - **File Size**: Auto-calculated if left empty
   - **Content**: Full description in Markdown format
   - **Zip File**: The downloadable file
   - **Images**: One or more screenshots (optional)

3. **Click Upload**: Files and content are automatically saved

### What Happens When You Upload

- Zip file saved to `public/downloads/`
- Images saved to `public/images/items/`
- Markdown file created in `content/downloads/`
- Item immediately appears on the homepage

## Plugin Types & Categories

### TopCollections
**Categories**: Farming, Mining, Combat, Building, etc.

### TopMinions
**Categories**: Farming, Mining, Combat, Fishing, etc.

### TopMinionCrafting
**Categories**: Basic Recipes, Advanced Recipes, Materials, etc.

### RecipeBook
**No categories needed** - all items display together

## Security

### Authentication

- Uses `nuxt-auth-utils` for session management
- Password-based authentication (no database required)
- Protected API endpoints

### Best Practices

1. **Change the default credentials** by setting `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`
2. **Use a strong password** with letters, numbers, and symbols
3. **Keep your .env file** out of version control
4. **Use HTTPS** in production

## Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

Don't forget to set your `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables in your deployment platform!

## Tech Stack

- **Nuxt 3** - Full-stack framework
- **Nuxt Content** - File-based CMS
- **Tailwind CSS v4** - Styling
- **nuxt-auth-utils** - Authentication
- **TypeScript** - Type safety
