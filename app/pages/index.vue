<script setup lang="ts">
// Fetch resources from database
const { data: resourcesData } = await useFetch('/api/resources');
const { data: session } = await useFetch('/api/auth/session');

const allResources = computed(() => resourcesData.value?.resources || []);

// Search and filter state
const searchQuery = ref('');
const selectedPluginType = ref('All');
const selectedCategory = ref('All');

// Plugin types for filter
const pluginTypes = ['All', 'TopCollections', 'TopMinions', 'TopMinionCrafting', 'RecipeBook', 'Other'];

// Get unique categories
const categories = computed(() => {
  const cats = new Set<string>(['All']);
  allResources.value?.forEach((item: any) => {
    if (item.category) cats.add(item.category);
  });
  return Array.from(cats);
});

// Filtered resources
const filteredResources = computed(() => {
  let items = allResources.value || [];

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter((item: any) =>
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  }

  // Filter by plugin type
  if (selectedPluginType.value !== 'All') {
    items = items.filter((item: any) => item.pluginType === selectedPluginType.value);
  }

  // Filter by category
  if (selectedCategory.value !== 'All') {
    items = items.filter((item: any) => item.category === selectedCategory.value);
  }

  return items;
});

// Stats
const totalResources = computed(() => allResources.value?.length || 0);

// Modal state
const selectedItem = ref<any>(null);
const showModal = ref(false);

const openModal = (item: any) => {
  selectedItem.value = item;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedItem.value = null;
};

// Download tracking
const handleDownload = async (resourceId: string, downloadUrl: string) => {
  try {
    // Track download
    await $fetch(`/api/resources/${resourceId}/download`, {
      method: 'POST'
    });

    // Trigger download
    window.location.href = downloadUrl;
  } catch (error) {
    console.error('Failed to track download:', error);
    // Still allow download even if tracking fails
    window.location.href = downloadUrl;
  }
};

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="border-b border-gray-200 bg-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">MystiPixel Resources</h1>
              <p class="text-xs text-gray-500">Plugin Configurations & Downloads</p>
            </div>
          </div>
          <div class="flex items-center gap-6">
            <div class="hidden text-sm md:block">
              <span class="font-semibold text-gray-900">{{ totalResources }}</span>
              <span class="text-gray-600"> Resources</span>
            </div>
            <div v-if="session?.authenticated" class="flex items-center gap-4">
              <NuxtLink to="/dashboard" class="text-sm font-medium text-gray-700 hover:text-blue-600">
                Dashboard
              </NuxtLink>
              <NuxtLink
                v-if="session.user?.role === 'ADMIN'"
                to="/admin/moderate"
                class="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Admin
              </NuxtLink>
            </div>
            <div v-else class="flex items-center gap-4">
              <NuxtLink to="/login" class="text-sm font-medium text-gray-700 hover:text-blue-600">
                Login
              </NuxtLink>
              <NuxtLink to="/register" class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                Sign Up
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Search Bar -->
    <div class="border-b border-gray-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex-1 max-w-2xl">
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search resources..."
              />
            </div>
          </div>
          <div class="flex gap-3">
            <select
              v-model="selectedPluginType"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option v-for="type in pluginTypes" :key="type" :value="type">
                {{ type === 'All' ? 'All Plugins' : type }}
              </option>
            </select>
            <select
              v-model="selectedCategory"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat === 'All' ? 'All Categories' : cat }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Results Info -->
      <div class="mb-6">
        <p class="text-sm text-gray-600">
          Showing <span class="font-semibold text-gray-900">{{ filteredResources.length }}</span> resource{{ filteredResources.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Resources Grid -->
      <div v-if="filteredResources.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="item in filteredResources"
          :key="item.id"
          @click="openModal(item)"
          class="group overflow-hidden rounded-lg bg-white text-left shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-blue-500"
        >
          <!-- Image -->
          <div class="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              v-if="item.latestVersion?.imageUrls && JSON.parse(item.latestVersion.imageUrls)[0]"
              :src="JSON.parse(item.latestVersion.imageUrls)[0]"
              :alt="item.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
              <svg class="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
            </div>

            <!-- Plugin Type Badge -->
            <div class="absolute left-3 top-3">
              <span class="inline-flex items-center rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white shadow-sm">
                {{ item.pluginType }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <div class="mb-2 flex items-start justify-between gap-2">
              <h3 class="font-semibold text-gray-900 group-hover:text-blue-600">
                {{ item.title }}
              </h3>
            </div>

            <p class="mb-3 line-clamp-2 text-sm text-gray-600">
              {{ item.description }}
            </p>

            <!-- Metadata -->
            <div class="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <div v-if="item.category" class="flex items-center gap-1">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{{ item.category }}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span>v{{ item.currentVersion }}</span>
              </div>
              <div v-if="item.latestVersion?.fileSize" class="flex items-center gap-1">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>{{ item.latestVersion.fileSize }}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{{ item.downloadCount }}</span>
              </div>
            </div>

            <!-- Download Indicator -->
            <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <span class="text-xs font-medium text-gray-600">By {{ item.author }}</span>
              <span class="text-xs font-medium text-blue-600">View Details →</span>
            </div>
          </div>
        </button>
      </div>

      <!-- No Results -->
      <div v-else class="py-16 text-center">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-semibold text-gray-900">No resources found</h3>
        <p class="mt-2 text-sm text-gray-600">Try adjusting your search or filters</p>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal && selectedItem" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="closeModal"></div>
        <div class="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
          <button @click="closeModal" class="absolute right-4 top-4 z-20 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Header Image -->
          <div v-if="selectedItem.latestVersion?.imageUrls" class="relative">
            <img
              :src="JSON.parse(selectedItem.latestVersion.imageUrls)[0]"
              :alt="selectedItem.title"
              class="w-full h-64 object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <span class="inline-flex items-center rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                {{ selectedItem.pluginType }}
              </span>
            </div>
          </div>

          <div class="p-8">
            <!-- Title and Meta -->
            <div class="mb-6">
              <h2 class="mb-3 text-3xl font-bold text-gray-900">{{ selectedItem.title }}</h2>
              <p class="text-lg text-gray-600">{{ selectedItem.description }}</p>
              <p class="mt-2 text-sm text-gray-500">By {{ selectedItem.author }}</p>
            </div>

            <!-- Stats Bar -->
            <div class="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-4">
              <div v-if="selectedItem.category">
                <p class="text-xs font-medium text-gray-500">CATEGORY</p>
                <p class="mt-1 text-sm font-semibold text-gray-900">{{ selectedItem.category }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">VERSION</p>
                <p class="mt-1 text-sm font-semibold text-gray-900">v{{ selectedItem.currentVersion }}</p>
              </div>
              <div v-if="selectedItem.latestVersion?.fileSize">
                <p class="text-xs font-medium text-gray-500">FILE SIZE</p>
                <p class="mt-1 text-sm font-semibold text-gray-900">{{ selectedItem.latestVersion.fileSize }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500">DOWNLOADS</p>
                <p class="mt-1 text-sm font-semibold text-gray-900">{{ selectedItem.downloadCount }}</p>
              </div>
            </div>

            <!-- Download Button -->
            <button
              v-if="selectedItem.latestVersion?.zipUrl"
              @click="handleDownload(selectedItem.id, selectedItem.latestVersion.zipUrl)"
              class="mb-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Now
            </button>

            <!-- Description Content -->
            <div class="border-t border-gray-200 pt-6">
              <h3 class="mb-4 text-lg font-semibold text-gray-900">About this resource</h3>
              <div class="prose max-w-none" v-html="selectedItem.content"></div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
