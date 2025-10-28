<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
});

const route = useRoute();
const resourceId = route.params.id as string;

const { data: resourceData, refresh } = await useFetch(`/api/resources/${resourceId}`);
const resource = computed(() => resourceData.value?.resource);

const { data: versionsData, refresh: refreshVersions } = await useFetch(`/api/resources/${resourceId}/versions`);
const versions = computed(() => versionsData.value?.versions || []);

// Edit Mode: 'info' or 'version'
const editMode = ref<'info' | 'version'>('info');

// Info Edit Fields
const title = ref('');
const description = ref('');
const pluginType = ref('');
const category = ref('');
const content = ref('');

// Version Fields
const newVersion = ref('');
const changelog = ref('');
const zipFile = ref<File | null>(null);
const imageFiles = ref<File[]>([]);

const loading = ref(false);
const error = ref('');
const success = ref('');

const pluginTypes = ['TopCollections', 'TopMinions', 'TopMinionCrafting', 'RecipeBook', 'Other'];
const categories = ['Farming', 'Combat', 'UI/Themes', 'Automation', 'Economy', 'Tools', 'Fun', 'Other'];

// Initialize form with resource data
watch(resource, (newResource) => {
  if (newResource) {
    title.value = newResource.title;
    description.value = newResource.description;
    pluginType.value = newResource.pluginType;
    category.value = newResource.category || '';
    content.value = newResource.content;
  }
}, { immediate: true });

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

// Update resource info
const updateInfo = async () => {
  error.value = '';
  success.value = '';

  if (!title.value || !description.value || !pluginType.value || !content.value) {
    error.value = 'Please fill in all required fields';
    return;
  }

  loading.value = true;

  try {
    await $fetch(`/api/resources/${resourceId}`, {
      method: 'PUT',
      body: {
        title: title.value,
        description: description.value,
        pluginType: pluginType.value,
        category: category.value,
        content: content.value
      }
    });

    success.value = 'Resource information updated successfully!';
    refresh();
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to update resource';
  } finally {
    loading.value = false;
  }
};

// Add new version
const addVersion = async () => {
  error.value = '';
  success.value = '';

  if (!newVersion.value || !zipFile.value) {
    error.value = 'Please provide version number and ZIP file';
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();
    formData.append('version', newVersion.value);
    formData.append('changelog', changelog.value || 'No changelog provided');
    formData.append('zip', zipFile.value);

    for (const image of imageFiles.value) {
      formData.append('images', image);
    }

    await $fetch(`/api/resources/${resourceId}/versions`, {
      method: 'POST',
      body: formData
    });

    success.value = 'New version added successfully!';
    newVersion.value = '';
    changelog.value = '';
    zipFile.value = null;
    imageFiles.value = [];
    refreshVersions();
    refresh();
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to add new version';
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
            <h1 class="text-2xl font-bold text-gray-900">Edit Resource</h1>
          </div>
          <NuxtLink to="/dashboard" class="text-sm text-gray-600 hover:text-gray-900">
            Back to Dashboard
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Mode Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex gap-8">
          <button
            @click="editMode = 'info'"
            :class="[
              'pb-4 px-1 border-b-2 font-medium text-sm',
              editMode === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Edit Information
          </button>
          <button
            @click="editMode = 'version'"
            :class="[
              'pb-4 px-1 border-b-2 font-medium text-sm',
              editMode === 'version'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Add New Version
          </button>
        </nav>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="rounded-lg bg-green-50 border border-green-200 p-4 mb-6">
        <div class="flex">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <p class="ml-3 text-sm text-green-800">{{ success }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="rounded-md bg-red-50 p-4 mb-6">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="ml-3 text-sm text-red-800">{{ error }}</p>
        </div>
      </div>

      <!-- Edit Information Form -->
      <form v-if="editMode === 'info'" @submit.prevent="updateInfo" class="space-y-6">
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
            <span v-if="!loading">Save Changes</span>
            <span v-else>Saving...</span>
          </button>
        </div>
      </form>

      <!-- Add New Version Form -->
      <div v-if="editMode === 'version'" class="space-y-6">
        <!-- Version History -->
        <div class="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Version History (Last 10)</h2>

          <div v-if="versions.length > 0" class="space-y-3">
            <div
              v-for="version in versions"
              :key="version.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-md"
            >
              <div>
                <h3 class="font-semibold text-gray-900">v{{ version.version }}</h3>
                <p class="text-sm text-gray-600">{{ version.changelog }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ new Date(version.createdAt).toLocaleDateString() }} • {{ version.fileSize }}
                </p>
              </div>
              <a
                :href="version.zipUrl"
                download
                class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Download
              </a>
            </div>
          </div>

          <p v-else class="text-sm text-gray-500">No versions found</p>
        </div>

        <!-- Add New Version Form -->
        <form @submit.prevent="addVersion" class="space-y-6">
          <div class="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Add New Version</h2>

            <div class="space-y-4">
              <!-- Version & Changelog -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="newVersion" class="block text-sm font-medium text-gray-700">
                    Version <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="newVersion"
                    v-model="newVersion"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="1.1.0"
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
                    placeholder="Bug fixes and improvements"
                  />
                </div>
              </div>

              <!-- ZIP File -->
              <div>
                <label for="zipVersion" class="block text-sm font-medium text-gray-700">
                  ZIP File <span class="text-red-500">*</span>
                </label>
                <input
                  id="zipVersion"
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
                <label for="imagesVersion" class="block text-sm font-medium text-gray-700">
                  Screenshots/Images (Optional)
                </label>
                <input
                  id="imagesVersion"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  @change="onImagesSelect"
                  class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p class="mt-1 text-xs text-gray-500">PNG, JPG, JPEG, or WebP. Max 5MB each</p>
                <div v-if="imageFiles.length > 0" class="mt-2">
                  <p class="text-xs text-green-600">✓ {{ imageFiles.length }} image(s) selected</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="newVersion = ''; changelog = ''; zipFile = null; imageFiles = []"
              class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              <span v-if="!loading">Add Version</span>
              <span v-else>Adding...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
