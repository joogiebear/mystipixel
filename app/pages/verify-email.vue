<script setup lang="ts">
definePageMeta({
  layout: false
});

const route = useRoute();
const token = route.query.token as string;

const loading = ref(true);
const success = ref(false);
const error = ref('');

onMounted(async () => {
  if (!token) {
    error.value = 'Invalid verification link';
    loading.value = false;
    return;
  }

  try {
    const response = await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: { token }
    });

    if (response.success) {
      success.value = true;
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigateTo('/dashboard');
      }, 3000);
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Verification failed';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
    <div class="w-full max-w-md">
      <div class="rounded-lg bg-white p-8 shadow-xl text-center">
        <!-- Loading State -->
        <div v-if="loading">
          <div class="mb-6 flex h-16 w-16 mx-auto items-center justify-center">
            <svg class="h-16 w-16 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 class="mb-2 text-2xl font-bold text-gray-900">Verifying Email...</h2>
          <p class="text-gray-600">Please wait while we verify your email address</p>
        </div>

        <!-- Success State -->
        <div v-else-if="success">
          <div class="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100">
            <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="mb-4 text-2xl font-bold text-gray-900">Email Verified!</h2>
          <p class="mb-6 text-gray-600">
            Your email has been successfully verified. You can now upload resources and access all features.
          </p>
          <div class="flex flex-col gap-3">
            <NuxtLink
              to="/dashboard"
              class="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Go to Dashboard
            </NuxtLink>
            <NuxtLink
              to="/"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              Browse Resources
            </NuxtLink>
          </div>
        </div>

        <!-- Error State -->
        <div v-else>
          <div class="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-red-100">
            <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="mb-4 text-2xl font-bold text-gray-900">Verification Failed</h2>
          <p class="mb-6 text-red-600">{{ error }}</p>
          <div class="flex flex-col gap-3">
            <NuxtLink
              to="/resend-verification"
              class="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Resend Verification Email
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Login
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
