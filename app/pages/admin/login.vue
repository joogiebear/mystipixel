<script setup lang="ts">
definePageMeta({
  layout: false
});

// Redirect to main login page
onMounted(() => {
  navigateTo('/login');
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
    <div class="text-center">
      <p class="text-gray-600">Redirecting to login...</p>
    </div>
  </div>
</template>
