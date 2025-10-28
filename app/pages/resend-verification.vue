<script setup lang="ts">
definePageMeta({
  layout: false
});

const email = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

const resendVerification = async () => {
  if (!email.value) {
    error.value = 'Please enter your email address';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: {
        email: email.value
      }
    });

    if (response.success) {
      success.value = true;
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to resend verification email';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
    <div class="w-full max-w-md">
      <!-- Success Message -->
      <div v-if="success" class="rounded-lg bg-white p-8 shadow-xl">
        <div class="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100">
          <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="mb-4 text-center text-2xl font-bold text-gray-900">Email Sent!</h2>
        <p class="mb-6 text-center text-gray-600">
          We've sent a new verification link to <strong>{{ email }}</strong>. Please check your inbox and spam folder.
        </p>
        <div class="flex flex-col gap-3">
          <NuxtLink
            to="/login"
            class="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Go to Login
          </NuxtLink>
          <button
            @click="success = false; email = ''"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            Resend to a different email
          </button>
        </div>
      </div>

      <!-- Resend Form -->
      <div v-else class="rounded-lg bg-white p-8 shadow-xl">
        <div class="mb-8 text-center">
          <NuxtLink to="/" class="inline-flex items-center gap-2 mb-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900">Resend Verification</h1>
          <p class="mt-2 text-gray-600">Enter your email to receive a new verification link</p>
        </div>

        <form @submit.prevent="resendVerification" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="you@example.com"
              @input="error = ''"
            />
            <p class="mt-1 text-xs text-gray-500">
              We'll send a verification link to this email address
            </p>
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
          <button
            type="submit"
            :disabled="loading"
            class="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            <span v-if="!loading">Send Verification Email</span>
            <span v-else class="flex items-center">
              <svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </span>
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already verified?
            <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </NuxtLink>
          </p>
        </div>

        <!-- Back to Home -->
        <div class="mt-4 text-center">
          <NuxtLink to="/" class="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
