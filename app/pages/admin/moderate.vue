<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
});

const { data: session } = await useFetch('/api/auth/session');

// Redirect if not admin
if (session.value?.user?.role !== 'ADMIN') {
  navigateTo('/dashboard');
}

const activeTab = ref<'resources' | 'users'>('resources');

const { data: resourcesData, refresh: refreshResources } = await useFetch('/api/admin/resources');
const { data: usersData, refresh: refreshUsers } = await useFetch('/api/admin/users');

const resources = computed(() => resourcesData.value?.resources || []);
const users = computed(() => usersData.value?.users || []);

const filterApproved = ref<string>('all');
const filterVisible = ref<string>('all');

const filteredResources = computed(() => {
  let filtered = resources.value;

  if (filterApproved.value === 'true') {
    filtered = filtered.filter((r: any) => r.isApproved);
  } else if (filterApproved.value === 'false') {
    filtered = filtered.filter((r: any) => !r.isApproved);
  }

  if (filterVisible.value === 'true') {
    filtered = filtered.filter((r: any) => r.isVisible);
  } else if (filterVisible.value === 'false') {
    filtered = filtered.filter((r: any) => !r.isVisible);
  }

  return filtered;
});

const approveResource = async (id: string) => {
  try {
    await $fetch(`/api/admin/resources/${id}/approve`, { method: 'PATCH' });
    refreshResources();
  } catch (e: any) {
    alert(e.data?.message || 'Failed to toggle approval');
  }
};

const toggleVisibility = async (id: string) => {
  try {
    await $fetch(`/api/admin/resources/${id}/hide`, { method: 'PATCH' });
    refreshResources();
  } catch (e: any) {
    alert(e.data?.message || 'Failed to toggle visibility');
  }
};

const deleteResource = async (id: string, title: string) => {
  if (!confirm(`Are you sure you want to delete "${title}"?`)) {
    return;
  }

  try {
    await $fetch(`/api/admin/resources/${id}/delete`, { method: 'DELETE' });
    refreshResources();
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete resource');
  }
};

const banUser = async (id: string, username: string) => {
  if (!confirm(`Are you sure you want to ban/unban "${username}"?`)) {
    return;
  }

  try {
    await $fetch(`/api/admin/users/${id}/ban`, { method: 'PATCH' });
    refreshUsers();
  } catch (e: any) {
    alert(e.data?.message || 'Failed to toggle ban');
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
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-600">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <span class="text-xl font-bold text-gray-900">Admin Panel</span>
                <span class="block text-xs text-gray-500">MystiPixel Resources</span>
              </div>
            </NuxtLink>
          </div>
          <div class="flex items-center gap-4">
            <NuxtLink to="/dashboard" class="text-sm text-gray-600 hover:text-gray-900">
              My Dashboard
            </NuxtLink>
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
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Resources</p>
              <p class="text-2xl font-semibold text-gray-900">{{ resources.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending Approval</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ resources.filter((r: any) => !r.isApproved).length }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-semibold text-gray-900">{{ users.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Banned Users</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ users.filter((u: any) => u.isBanned).length }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex gap-8">
          <button
            @click="activeTab = 'resources'"
            :class="[
              'pb-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'resources'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Resources ({{ resources.length }})
          </button>
          <button
            @click="activeTab = 'users'"
            :class="[
              'pb-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Users ({{ users.length }})
          </button>
        </nav>
      </div>

      <!-- Resources Tab -->
      <div v-if="activeTab === 'resources'">
        <!-- Filters -->
        <div class="mb-6 flex gap-4">
          <select
            v-model="filterApproved"
            class="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All Approval Status</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>

          <select
            v-model="filterVisible"
            class="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All Visibility</option>
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>
        </div>

        <!-- Resources Table -->
        <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="resource in filteredResources" :key="resource.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ resource.title }}</div>
                    <div class="text-sm text-gray-500">{{ resource.pluginType }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ resource.user.username }}</div>
                  <div class="text-sm text-gray-500">{{ resource.user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col gap-1">
                    <span
                      :class="[
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        resource.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      ]"
                    >
                      {{ resource.isApproved ? 'Approved' : 'Pending' }}
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
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ resource.downloadCount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-2">
                    <button
                      @click="approveResource(resource.id)"
                      :class="[
                        'px-3 py-1 rounded text-xs font-semibold',
                        resource.isApproved
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      ]"
                    >
                      {{ resource.isApproved ? 'Unapprove' : 'Approve' }}
                    </button>
                    <button
                      @click="toggleVisibility(resource.id)"
                      class="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-700"
                    >
                      {{ resource.isVisible ? 'Hide' : 'Show' }}
                    </button>
                    <button
                      @click="deleteResource(resource.id, resource.title)"
                      class="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredResources.length === 0" class="text-center py-8 text-gray-500">
            No resources found
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'">
        <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resources
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col gap-1">
                    <span
                      :class="[
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        user.emailVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      ]"
                    >
                      {{ user.emailVerified ? 'Verified' : 'Unverified' }}
                    </span>
                    <span
                      v-if="user.isBanned"
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800"
                    >
                      Banned
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ user._count.resources }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ new Date(user.createdAt).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    v-if="user.role !== 'ADMIN'"
                    @click="banUser(user.id, user.username)"
                    :class="[
                      'px-3 py-1 rounded text-xs font-semibold',
                      user.isBanned
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    ]"
                  >
                    {{ user.isBanned ? 'Unban' : 'Ban' }}
                  </button>
                  <span v-else class="text-xs text-gray-500">Admin</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="users.length === 0" class="text-center py-8 text-gray-500">
            No users found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
