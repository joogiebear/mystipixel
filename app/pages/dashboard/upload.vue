<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
});

const { data: session } = await useFetch('/api/auth/session');

// Form fields
const title = ref('');
const description = ref('');
const pluginType = ref('');
const category = ref('');
const version = ref('1.0.0');
const changelog = ref('Initial release');
const content = ref(`## Main Description

Write a detailed description of your resource here. Explain what it does and why it's useful.

## What's Included

- Feature 1
- Feature 2
- Feature 3

## Features

### Feature 1
Description of feature 1

### Feature 2
Description of feature 2

## Installation

1. Download the ZIP file
2. Extract the contents
3. Place files in the appropriate plugin folder
4. Configure as needed

## Requirements

- Plugin Name v1.0+
- Minecraft 1.20+

## Support

For support, please contact...`);

const zipFile = ref<File | null>(null);
const imageFiles = ref<File[]>([]);

const loading = ref(false);
const error = ref('');
const success = ref(false);

const pluginTypes = [
  'TopCollections',
  'TopMinions',
  'TopMinionCrafting',
  'RecipeBook',
  'Other'
];

const categories = [
  'Farming',
  'Combat',
  'UI/Themes',
  'Automation',
  'Economy',
  'Tools',
  'Fun',
  'Other'
];

// Handle ZIP file selection
const onZipSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (!file.name.toLowerCase().endsWith('.zip')) {
      error.value = 'Please select a ZIP file';
      zipFile.value = null;
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      error.value = 'ZIP file must be less than 50MB';
      zipFile.value = null;
      return;
    }
    zipFile.value = file;
    error.value = '';
  }
};

// Handle image file selection
const onImagesSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    const validFiles: File[] = [];

    for (const file of files) {
      const ext = file.name.toLowerCase();
      if (!ext.endsWith('.png') && !ext.endsWith('.jpg') && !ext.endsWith('.jpeg') && !ext.endsWith('.webp')) {
        error.value = 'Images must be PNG, JPG, JPEG, or WebP';
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        error.value = `Image ${file.name} must be less than 5MB`;
        continue;
      }
      validFiles.push(file);
    }

    imageFiles.value = validFiles;
    error.value = '';
  }
};

// Submit form
const uploadResource = async () => {
  error.value = '';

  // Validation
  if (!title.value || !description.value || !pluginType.value || !content.value || !version.value || !zipFile.value) {
    error.value = 'Please fill in all required fields and select a ZIP file';
    return;
  }

  loading.value = true;

  try {
    // Create FormData
    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('description', description.value);
    formData.append('pluginType', pluginType.value);
    formData.append('category', category.value);
    formData.append('content', content.value);
    formData.append('version', version.value);
    formData.append('changelog', changelog.value);
    formData.append('zip', zipFile.value);

    for (const image of imageFiles.value) {
      formData.append('images', image);
    }

    // Upload
    const response = await $fetch('/api/resources', {
      method: 'POST',
      body: formData
    });

    success.value = true;

    // Redirect after 2 seconds
    setTimeout(() => {
      navigateTo('/dashboard');
    }, 2000);
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to upload resource';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/dashboard" class="text-gray-600 hover:text-gray-900">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">Upload Resource</h1>
          </div>
          <NuxtLink to="/dashboard" class="text-sm text-gray-600 hover:text-gray-900">
            Cancel
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Success Message -->
      <div v-if="success" class="rounded-lg bg-green-50 border border-green-200 p-4 mb-6">
        <div class="flex">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <p class="text-sm text-green-800">
              Resource uploaded successfully! Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>

      <!-- Upload Form -->
      <form v-if="!success" @submit.prevent="uploadResource" class="space-y-6">
        <!-- Basic Info Section -->
        <div class="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div class="space-y-4">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700">
                Title <span class="text-red-500">*</span>
              </label>
              <input
                id="title"
                v-model="title"
                type="text"
                required
                maxlength="100"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="My Awesome Resource"
              />
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">
                Short Description <span class="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                v-model="description"
                required
                maxlength="500"
                rows="3"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="A brief description of your resource (max 500 characters)"
              />
              <p class="mt-1 text-xs text-gray-500">{{ description.length }}/500 characters</p>
            </div>

            <!-- Plugin Type & Category -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="pluginType" class="block text-sm font-medium text-gray-700">
                  Plugin Type <span class="text-red-500">*</span>
                </label>
                <select
                  id="pluginType"
                  v-model="pluginType"
                  required
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Select plugin type</option>
                  <option v-for="type in pluginTypes" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>

              <div>
                <label for="category" class="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  v-model="category"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
            </div>

            <!-- Version & Changelog -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="version" class="block text-sm font-medium text-gray-700">
                  Version <span class="text-red-500">*</span>
                </label>
                <input
                  id="version"
                  v-model="version"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label for="changelog" class="block text-sm font-medium text-gray-700">
                  Changelog
                </label>
                <input
                  id="changelog"
                  v-model="changelog"
                  type="text"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Initial release"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Full Description (Markdown)</h2>

          <div>
            <textarea
              id="content"
              v-model="content"
              required
              rows="15"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <p class="mt-2 text-xs text-gray-500">Use Markdown formatting for rich text</p>
          </div>
        </div>

        <!-- Files Section -->
        <div class="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Files</h2>

          <div class="space-y-4">
            <!-- ZIP File -->
            <div>
              <label for="zip" class="block text-sm font-medium text-gray-700">
                ZIP File <span class="text-red-500">*</span>
              </label>
              <input
                id="zip"
                type="file"
                accept=".zip"
                required
                @change="onZipSelect"
                class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p class="mt-1 text-xs text-gray-500">Maximum file size: 50MB</p>
              <p v-if="zipFile" class="mt-1 text-xs text-green-600">✓ {{ zipFile.name }} selected</p>
            </div>

            <!-- Images -->
            <div>
              <label for="images" class="block text-sm font-medium text-gray-700">
                Screenshots/Images (Optional)
              </label>
              <input
                id="images"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                @change="onImagesSelect"
                class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p class="mt-1 text-xs text-gray-500">PNG, JPG, JPEG, or WebP. Max 5MB each</p>
              <div v-if="imageFiles.length > 0" class="mt-2">
                <p class="text-xs text-green-600">✓ {{ imageFiles.length }} image(s) selected:</p>
                <ul class="mt-1 text-xs text-gray-600 list-disc list-inside">
                  <li v-for="(img, idx) in imageFiles" :key="idx">{{ img.name }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="ml-3 text-sm text-red-800">{{ error }}</p>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-3">
          <NuxtLink
            to="/dashboard"
            class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
          >
            <span v-if="!loading">Upload Resource</span>
            <span v-else class="flex items-center">
              <svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading...
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
