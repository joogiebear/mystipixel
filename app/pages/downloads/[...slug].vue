<script setup lang="ts">
const route = useRoute();
const { data: item } = await useAsyncData(`download-${route.path}`, () =>
  queryContent(route.path).findOne()
);

if (!item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Download not found' });
}

const currentImageIndex = ref(0);

const nextImage = () => {
  if (item.value.images && currentImageIndex.value < item.value.images.length - 1) {
    currentImageIndex.value++;
  }
};

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

const selectImage = (index: number) => {
  currentImageIndex.value = index;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <NuxtLink
        to="/downloads"
        class="mb-8 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Downloads
      </NuxtLink>

      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Image Gallery -->
        <div class="space-y-4">
          <div class="relative overflow-hidden rounded-lg bg-gray-200">
            <div class="aspect-video w-full">
              <img
                v-if="item.images && item.images.length > 0"
                :src="item.images[currentImageIndex]"
                :alt="`${item.title} - Image ${currentImageIndex + 1}`"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-gray-400"
              >
                <svg class="h-24 w-24" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <!-- Navigation Arrows -->
            <button
              v-if="item.images && item.images.length > 1"
              @click="prevImage"
              :disabled="currentImageIndex === 0"
              class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-opacity hover:bg-black/70 disabled:opacity-30"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              v-if="item.images && item.images.length > 1"
              @click="nextImage"
              :disabled="currentImageIndex === item.images.length - 1"
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-opacity hover:bg-black/70 disabled:opacity-30"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <!-- Thumbnail Gallery -->
          <div
            v-if="item.images && item.images.length > 1"
            class="grid grid-cols-4 gap-2"
          >
            <button
              v-for="(image, index) in item.images"
              :key="index"
              @click="selectImage(index)"
              class="aspect-video overflow-hidden rounded-md border-2 transition-all"
              :class="
                currentImageIndex === index
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-gray-300'
              "
            >
              <img :src="image" :alt="`Thumbnail ${index + 1}`" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Details -->
        <div class="space-y-6">
          <!-- Featured Badge -->
          <div v-if="item.featured" class="inline-block">
            <span class="rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
              Featured
            </span>
          </div>

          <div>
            <h1 class="text-4xl font-bold text-gray-900">{{ item.title }}</h1>
            <p class="mt-4 text-lg text-gray-600">{{ item.description }}</p>
          </div>

          <!-- Meta Information -->
          <div class="flex flex-wrap gap-4 border-y border-gray-200 py-4">
            <div v-if="item.category">
              <p class="text-sm text-gray-500">Category</p>
              <p class="font-medium text-gray-900">{{ item.category }}</p>
            </div>
            <div v-if="item.version">
              <p class="text-sm text-gray-500">Version</p>
              <p class="font-medium text-gray-900">{{ item.version }}</p>
            </div>
            <div v-if="item.fileSize">
              <p class="text-sm text-gray-500">File Size</p>
              <p class="font-medium text-gray-900">{{ item.fileSize }}</p>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="item.tags && item.tags.length" class="flex flex-wrap gap-2">
            <span
              v-for="tag in item.tags"
              :key="tag"
              class="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Download Button -->
          <a
            :href="item.downloadUrl"
            download
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Free
          </a>

          <p class="text-center text-sm text-gray-500">
            Free to download and use • No registration required
          </p>
        </div>
      </div>

      <!-- Content Section -->
      <div class="mt-12 rounded-lg bg-white p-8 shadow-md">
        <ContentRenderer :value="item" class="prose prose-lg max-w-none" />
      </div>
    </div>
  </div>
</template>
