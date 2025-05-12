export default {
  set() {
    sessionStorage.setItem('visibilityStore', `${Date.now()}`);
  },
  get() {
    return sessionStorage.getItem('visibilityStore');
  },
  clear() {
    sessionStorage.removeItem('visibilityStore');
  },
};
