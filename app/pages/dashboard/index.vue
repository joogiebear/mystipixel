<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
});

const { data: session } = await useFetch('/api/auth/session');
const { data: resourcesData, refresh } = await useFetch('/api/resources', {
  query: { userId: session.value?.user?.id }
});

const resources = computed(() => resourcesData.value?.resources || []);
const userResources = computed(() =>
  resources.value.filter((r: any) => r.userId === session.value?.user?.id)
);

const deleteResource = async (id: string, title: string) => {
  if (!confirm(`Are you sure you want to delete "${title}"? This action can be undone within 30 days.`)) {
    return;
  }

  try {
    await $fetch(`/api/resources/${id}`, {
      method: 'DELETE'
    });
    refresh();
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete resource');
  }
};

const toggleVisibility = async (id: string) => {
  try {
    await $fetch(`/api/resources/${id}/visibility`, {
      method: 'PATCH'
    });
    refresh();
  } catch (e: any) {
    alert(e.data?.message || 'Failed to toggle visibility');
  }
};

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' });
  navigateTo('/login');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="flex items-center gap-2">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <span class="text-xl font-bold text-gray-900">MystiPixel</span>
            </NuxtLink>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">{{ session?.user?.username }}</span>
            <button
              @click="logout"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Resources</h1>
        <p class="mt-2 text-gray-600">Manage your uploaded resources</p>
      </div>

      <!-- Email Verification Warning -->
      <div v-if="!session?.user?.emailVerified" class="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <p class="text-sm text-yellow-800">
              Please verify your email to upload resources.
              <NuxtLink to="/resend-verification" class="font-medium underline">
                Resend verification email
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>

      <!-- Upload Button -->
      <div class="mb-6">
        <NuxtLink
          to="/dashboard/upload"
          :class="[
            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm',
            session?.user?.emailVerified
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          ]"
          :disabled="!session?.user?.emailVerified"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Upload New Resource
        </NuxtLink>
      </div>

      <!-- Resources Grid -->
      <div v-if="userResources.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="resource in userResources"
          :key="resource.id"
          class="rounded-lg bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- Status Badges -->
          <div class="flex gap-2 mb-4">
            <span
              :class="[
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                resource.isApproved
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              ]"
            >
              {{ resource.isApproved ? 'Approved' : 'Pending Review' }}
            </span>
            <span
              :class="[
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                resource.isVisible
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ resource.isVisible ? 'Visible' : 'Hidden' }}
            </span>
          </div>

          <!-- Title & Plugin Type -->
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ resource.title }}</h3>
          <p class="text-sm text-gray-600 mb-1">{{ resource.pluginType }}</p>
          <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ resource.description }}</p>

          <!-- Stats -->
          <div class="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div class="flex items-center gap-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>{{ resource.downloadCount }}</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>v{{ resource.currentVersion }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <NuxtLink
              :to="`/dashboard/edit/${resource.id}`"
              class="flex-1 inline-flex justify-center items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Edit
            </NuxtLink>
            <button
              @click="toggleVisibility(resource.id)"
              class="flex-1 inline-flex justify-center items-center rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-300"
            >
              {{ resource.isVisible ? 'Hide' : 'Show' }}
            </button>
            <button
              @click="deleteResource(resource.id, resource.title)"
              class="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No resources</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by uploading your first resource.</p>
        <div class="mt-6">
          <NuxtLink
            to="/dashboard/upload"
            :class="[
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm',
              session?.user?.emailVerified
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            ]"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Upload New Resource
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
