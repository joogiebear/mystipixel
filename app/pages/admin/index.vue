<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

const { data: session, refresh: refreshSession } = await useFetch('/api/auth/session');

// Content template
const contentTemplate = `# Main Description

A comprehensive description of what this item provides and how it enhances gameplay.

## What's Included

- **Feature 1**: Description of the first feature
- **Feature 2**: Description of the second feature
- **Feature 3**: Description of the third feature
- **Documentation**: Complete setup guide and instructions

## Features

- Easy to install and configure
- Balanced and optimized for gameplay
- Compatible with latest version
- Regular updates and support

## Installation

1. Download the zip file
2. Extract to your plugin's folder
3. Reload the plugin or restart server
4. Follow the included setup guide

## Requirements

- Latest version of the plugin
- Sufficient storage space
- Basic understanding of configuration files

## Support

For help or questions, contact the server administrator.`;

// Form state
const title = ref('');
const description = ref('');
const pluginType = ref('TopCollections');
const category = ref('');
const version = ref('1.0.0');
const fileSize = ref('');
const content = ref(contentTemplate);
const zipFile = ref<File | null>(null);
const imageFiles = ref<File[]>([]);

const uploading = ref(false);
const uploadProgress = ref('');
const uploadSuccess = ref(false);
const uploadError = ref('');

// Plugin types
const pluginTypes = ['TopCollections', 'TopMinions', 'TopMinionCrafting', 'RecipeBook'];

// Check if category is needed
const needsCategory = computed(() => {
  return ['TopCollections', 'TopMinions', 'TopMinionCrafting'].includes(pluginType.value);
});

const logout = async () => {
  await $fetch('/api/auth/login.post.ts', {
    method: 'POST'
  });
  navigateTo('/admin/login');
};

const handleZipFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    zipFile.value = target.files[0];
    if (!fileSize.value) {
      const size = (target.files[0].size / 1024 / 1024).toFixed(1);
      fileSize.value = `${size}MB`;
    }
  }
};

const handleImageFiles = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    imageFiles.value = Array.from(target.files);
  }
};

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const uploadItem = async () => {
  if (!title.value || !description.value || !content.value || !zipFile.value) {
    uploadError.value = 'Please fill in all required fields and select a zip file';
    return;
  }

  if (needsCategory.value && !category.value) {
    uploadError.value = 'Category is required for this plugin type';
    return;
  }

  uploading.value = true;
  uploadProgress.value = 'Uploading files...';
  uploadError.value = '';
  uploadSuccess.value = false;

  try {
    const formData = new FormData();

    // Add all form fields
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('pluginType', pluginType.value);
    formData.append('category', category.value);
    formData.append('version', version.value);
    formData.append('fileSize', fileSize.value);
    formData.append('content', content.value);
    formData.append('zipFile', zipFile.value);

    // Add image files
    imageFiles.value.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });

    uploadProgress.value = 'Creating item...';

    const response = await $fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    });

    uploadSuccess.value = true;
    uploadProgress.value = 'Upload successful!';

    // Reset form
    setTimeout(() => {
      title.value = '';
      description.value = '';
      category.value = '';
      version.value = '1.0.0';
      fileSize.value = '';
      content.value = contentTemplate;
      zipFile.value = null;
      imageFiles.value = [];
      uploadSuccess.value = false;
      uploadProgress.value = '';

      // Reset file inputs
      const zipInput = document.getElementById('zipFile') as HTMLInputElement;
      const imageInput = document.getElementById('imageFiles') as HTMLInputElement;
      if (zipInput) zipInput.value = '';
      if (imageInput) imageInput.value = '';
    }, 3000);

  } catch (e: any) {
    uploadError.value = e.data?.message || 'Upload failed. Please try again.';
  } finally {
    uploading.value = false;
  }
};

// Redirect if not logged in
if (!session.value?.user) {
  navigateTo('/admin/login');
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="mx-auto max-w-5xl px-4 py-8">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p class="mt-1 text-gray-600">Upload new items to your download library</p>
        </div>
        <div class="flex gap-4">
          <NuxtLink
            to="/"
            class="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            View Site
          </NuxtLink>
          <button
            @click="logout"
            class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- Upload Form -->
      <div class="rounded-lg bg-white p-8 shadow-lg">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">Upload New Item</h2>

        <form @submit.prevent="uploadItem" class="space-y-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">
              Title <span class="text-red-600">*</span>
            </label>
            <input
              id="title"
              v-model="title"
              type="text"
              required
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="e.g., Farming Collection Pack"
            />
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">
              Description <span class="text-red-600">*</span>
            </label>
            <textarea
              id="description"
              v-model="description"
              required
              rows="3"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Brief description of the item"
            />
          </div>

          <!-- Plugin Type and Category -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="pluginType" class="block text-sm font-medium text-gray-700">
                Plugin Type <span class="text-red-600">*</span>
              </label>
              <select
                id="pluginType"
                v-model="pluginType"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option v-for="type in pluginTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <div v-if="needsCategory">
              <label for="category" class="block text-sm font-medium text-gray-700">
                Category <span class="text-red-600">*</span>
              </label>
              <input
                id="category"
                v-model="category"
                type="text"
                :required="needsCategory"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="e.g., Farming, Mining, Combat"
              />
            </div>
          </div>

          <!-- Version and File Size -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="version" class="block text-sm font-medium text-gray-700">
                Version
              </label>
              <input
                id="version"
                v-model="version"
                type="text"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="1.0.0"
              />
            </div>

            <div>
              <label for="fileSize" class="block text-sm font-medium text-gray-700">
                File Size
              </label>
              <input
                id="fileSize"
                v-model="fileSize"
                type="text"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="e.g., 2.5MB (auto-calculated if empty)"
              />
            </div>
          </div>

          <!-- Content (Markdown) -->
          <div>
            <label for="content" class="block text-sm font-medium text-gray-700">
              Content (Markdown) <span class="text-red-600">*</span>
            </label>
            <textarea
              id="content"
              v-model="content"
              required
              rows="12"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <p class="mt-1 text-xs text-gray-500">
              A template is pre-filled below. Customize the sections to match your item. Use markdown formatting.
            </p>
          </div>

          <!-- Zip File -->
          <div>
            <label for="zipFile" class="block text-sm font-medium text-gray-700">
              Zip File <span class="text-red-600">*</span>
            </label>
            <input
              id="zipFile"
              type="file"
              accept=".zip"
              required
              @change="handleZipFile"
              class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            <p class="mt-1 text-xs text-gray-500">
              The downloadable zip file (will be saved to /public/downloads/)
            </p>
          </div>

          <!-- Image Files -->
          <div>
            <label for="imageFiles" class="block text-sm font-medium text-gray-700">
              Images (Optional)
            </label>
            <input
              id="imageFiles"
              type="file"
              accept="image/*"
              multiple
              @change="handleImageFiles"
              class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            <p class="mt-1 text-xs text-gray-500">
              Upload one or more images (will be saved to /public/images/items/)
            </p>
            <div v-if="imageFiles.length > 0" class="mt-2">
              <p class="text-sm text-gray-700">Selected: {{ imageFiles.length }} image(s)</p>
            </div>
          </div>

          <!-- Progress Messages -->
          <div v-if="uploadProgress" class="rounded-md bg-blue-50 p-4">
            <p class="text-sm text-blue-800">{{ uploadProgress }}</p>
          </div>

          <div v-if="uploadSuccess" class="rounded-md bg-green-50 p-4">
            <p class="text-sm text-green-800">✓ Upload successful! Item has been created.</p>
          </div>

          <div v-if="uploadError" class="rounded-md bg-red-50 p-4">
            <p class="text-sm text-red-800">{{ uploadError }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="uploading"
            class="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            <span v-if="!uploading">Upload Item</span>
            <span v-else class="flex items-center justify-center">
              <svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading...
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
