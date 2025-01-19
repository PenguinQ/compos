export default {
  set() {
    sessionStorage.setItem('backupCreationDate', `${Date.now()}`);
  },
  get() {
    return sessionStorage.getItem('backupCreationDate');
  },
  clear() {
    sessionStorage.removeItem('backupCreationDate');
  },
};
