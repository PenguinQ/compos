import { ref, getCurrentInstance, onBeforeMount } from 'vue';

export default () => {
  const scope_id = ref<string | null | undefined>('');

  onBeforeMount(() => {
    scope_id.value = getCurrentInstance()?.vnode.scopeId;
  });

  return scope_id;
};
