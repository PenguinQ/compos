import type { RxDocument } from 'rxdb';

type PaginationSelector = {
  data: any[];
  sort?: 'asc' | 'desc';
  query?: string;
  queryKey: string;
};

export default ({ data, sort = 'desc', query, queryKey }: PaginationSelector) => {
  const first_id = data[0] ? data[0].id : '';
  const last_id = data[data.length - 1] ? data[data.length - 1].id : '';
  let first_selector = first_id ? sort === 'desc' ? { id: { $gt: first_id } } : { id: { $lt: first_id } } : undefined;
  let last_selector = last_id ? sort === 'desc' ? { id: { $lt: last_id } } : { id: { $gt: last_id } } : undefined;

  if (first_id && last_id && query) {
    const query_selector = {
      [queryKey]: { $regex: `.*${query}.*`, $options: 'i' },
    };

    if (sort === 'desc') {
      first_selector = { id: { $gt: first_id }, ...query_selector };
      last_selector = { id: { $lt: last_id }, ...query_selector };
    } else {
      first_selector = { id: { $lt: first_id }, ...query_selector };
      last_selector = { id: { $gt: last_id }, ...query_selector };
    }
  }

  return {
    first_selector,
    last_selector,
  };
};
