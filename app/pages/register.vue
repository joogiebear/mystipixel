<script setup lang="ts">
definePageMeta({
  layout: false
});

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const agreedToTerms = ref(false);

const loading = ref(false);
const error = ref('');
const success = ref(false);

const passwordStrength = computed(() => {
  const pwd = password.value;
  if (!pwd) return { strength: 0, label: '', color: '' };

  let strength = 0;
  if (pwd.length >= 8) strength++;
  if (pwd.length >= 12) strength++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
  if (/\d/.test(pwd)) strength++;
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

  if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
  if (strength === 3) return { strength, label: 'Fair', color: 'bg-yellow-500' };
  if (strength === 4) return { strength, label: 'Good', color: 'bg-blue-500' };
  return { strength, label: 'Strong', color: 'bg-green-500' };
});

const register = async () => {
  error.value = '';

  // Validation
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'All fields are required';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters';
    return;
  }

  if (!agreedToTerms.value) {
    error.value = 'You must agree to the terms and conditions';
    return;
  }

  loading.value = true;

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        username: username.value,
        email: email.value,
        password: password.value
      }
    });

    success.value = true;
  } catch (e: any) {
    error.value = e.data?.message || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Success Message -->
      <div v-if="success" class="rounded-lg bg-white p-8 shadow-xl">
        <div class="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100">
          <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="mb-4 text-center text-2xl font-bold text-gray-900">Check Your Email!</h2>
        <p class="mb-6 text-center text-gray-600">
          We've sent a verification link to <strong>{{ email }}</strong>. Please check your inbox and click the link to activate your account.
        </p>
        <p class="text-center text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or
          <button @click="navigateTo('/resend-verification')" class="text-blue-600 hover:text-blue-700 underline">
            resend verification email
          </button>
        </p>
      </div>

      <!-- Registration Form -->
      <div v-else class="rounded-lg bg-white p-8 shadow-xl">
        <div class="mb-8 text-center">
          <NuxtLink to="/" class="inline-flex items-center gap-2 mb-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900">Create Account</h1>
          <p class="mt-2 text-gray-600">Join MystiPixel Resources</p>
        </div>

        <form @submit.prevent="register" class="space-y-5">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="your_username"
              @input="error = ''"
            />
            <p class="mt-1 text-xs text-gray-500">3-20 characters, letters, numbers, hyphens, underscores</p>
          </div>

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
            <!-- Password Strength -->
            <div v-if="password" class="mt-2">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    :class="[passwordStrength.color, 'h-full transition-all']"
                    :style="{ width: `${(passwordStrength.strength / 5) * 100}%` }"
                  ></div>
                </div>
                <span class="text-xs font-medium" :class="{
                  'text-red-600': passwordStrength.strength <= 2,
                  'text-yellow-600': passwordStrength.strength === 3,
                  'text-blue-600': passwordStrength.strength === 4,
                  'text-green-600': passwordStrength.strength === 5
                }">
                  {{ passwordStrength.label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="••••••••"
              @input="error = ''"
            />
          </div>

          <!-- Terms Agreement -->
          <div class="flex items-start">
            <input
              id="terms"
              v-model="agreedToTerms"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="terms" class="ml-2 text-sm text-gray-600">
              I agree to the <a href="/terms" class="text-blue-600 hover:text-blue-700 underline">Terms of Service</a>
              and <a href="/privacy" class="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>
            </label>
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
            <span v-if="!loading">Create Account</span>
            <span v-else class="flex items-center">
              <svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
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
