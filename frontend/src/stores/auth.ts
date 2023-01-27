import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const loggedIn = ref(false);
  const token = ref("");

  function logOut() {
    loggedIn.value = false;
    token.value = "";
  }

  function logIn(newToken: string) {
    loggedIn.value = true;
    token.value = newToken;
  }
  return { loggedIn, logOut, logIn, token };
}, {
  persist: {
    paths: ['loggedIn', 'token']
  }
})
