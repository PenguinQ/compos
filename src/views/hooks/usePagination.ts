import { reactive } from 'vue';

type PaginationData = {
  current?: number;
  total?: number;
  limit?: number;
  first?: boolean;
  last?: boolean;
};

export default (data?: PaginationData) => {
  const page = reactive({
    current: data?.current || 1,
    total: data?.total || 1,
    limit: data?.limit || 10,
    first: data?.first !== undefined ? data.first : true,
    last: data?.last !== undefined ? data.last : true,
  });

  const toPrev = (first?: boolean) => {
    if (first) {
      page.current = 1;
    } else {
      if (page.current > 1) page.current -= 1;
    }
  };

  const toNext = (last?: boolean) => {
    if (last) {
      page.current = page.total;
    } else {
      if (page.current < page.total) page.current += 1;
    }
  };

  return {
    page,
    toPrev,
    toNext,
  };
};
