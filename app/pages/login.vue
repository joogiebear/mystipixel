<script setup lang="ts">
definePageMeta({
  layout: false
});

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const rememberMe = ref(false);

const login = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please enter email and password';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    });

    if (response.success) {
      // Redirect based on role
      if (response.user.role === 'ADMIN') {
        navigateTo('/admin/moderate');
      } else {
        navigateTo('/dashboard');
      }
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Invalid credentials';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
    <div class="w-full max-w-md">
      <div class="rounded-lg bg-white p-8 shadow-xl">
        <div class="mb-8 text-center">
          <NuxtLink to="/" class="inline-flex items-center gap-2 mb-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p class="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form @submit.prevent="login" class="space-y-6">
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
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="••••••••"
              @input="error = ''"
            />
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="remember" class="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <NuxtLink to="/forgot-password" class="text-sm text-blue-600 hover:text-blue-700">
              Forgot password?
            </NuxtLink>
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
            <span v-if="!loading">Sign In</span>
            <span v-else class="flex items-center">
              <svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          </button>
        </form>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <NuxtLink to="/register" class="font-medium text-blue-600 hover:text-blue-700">
              Create one now
            </NuxtLink>
          </p>
        </div>

        <!-- Resend Verification -->
        <div class="mt-4 text-center">
          <p class="text-xs text-gray-500">
            Didn't receive verification email?
            <NuxtLink to="/resend-verification" class="text-blue-600 hover:text-blue-700 underline">
              Resend
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
