import { ref, getCurrentInstance, onBeforeMount } from 'vue';

export default () => {
  const scopeId = ref<string | null | undefined>('');

  onBeforeMount(() => {
    scopeId.value = getCurrentInstance()?.vnode.scopeId;
  });

  return scopeId;
};
