<script setup lang="ts">
const { data: items } = await useAsyncData('downloads', () =>
  queryContent('/downloads')
    .sort({ featured: -1, title: 1 })
    .find()
);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Free Downloads
        </h1>
        <p class="mt-4 text-lg text-gray-600">
          Browse our collection of free config files, scripts, and resources
        </p>
      </div>

      <!-- Items Grid -->
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="item in items"
          :key="item._path"
          :to="item._path"
          class="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-xl"
        >
          <!-- Featured Badge -->
          <div
            v-if="item.featured"
            class="absolute left-4 top-4 z-10 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
          >
            Featured
          </div>

          <!-- Image -->
          <div class="aspect-video w-full overflow-hidden bg-gray-200">
            <img
              v-if="item.images && item.images[0]"
              :src="item.images[0]"
              :alt="item.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-gray-400"
            >
              <svg class="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <div class="mb-2 flex items-center gap-2">
              <span
                class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
              >
                {{ item.category }}
              </span>
              <span v-if="item.fileSize" class="text-xs text-gray-500">
                {{ item.fileSize }}
              </span>
            </div>

            <h3 class="mb-2 text-xl font-semibold text-gray-900">
              {{ item.title }}
            </h3>

            <p class="mb-4 line-clamp-2 text-sm text-gray-600">
              {{ item.description }}
            </p>

            <!-- Tags -->
            <div v-if="item.tags && item.tags.length" class="flex flex-wrap gap-2">
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                #{{ tag }}
              </span>
            </div>
          </div>

          <!-- Download Indicator -->
          <div
            class="border-t border-gray-100 bg-gray-50 px-6 py-4 text-sm font-medium text-blue-600 transition-colors group-hover:bg-blue-50"
          >
            View Details & Download →
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-if="!items || items.length === 0"
        class="py-16 text-center text-gray-500"
      >
        <svg
          class="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p class="mt-4 text-lg">No downloads available yet</p>
      </div>
    </div>
  </div>
</template>
