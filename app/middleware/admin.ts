export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data: session } = await useFetch('/api/auth/session');

  if (!session.value?.authenticated) {
    return navigateTo('/login');
  }

  if (session.value.user?.role !== 'ADMIN') {
    return navigateTo('/dashboard');
  }
});
