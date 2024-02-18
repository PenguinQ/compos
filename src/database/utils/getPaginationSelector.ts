import type { RxDocument } from 'rxdb';

type PaginationSelector = {
  data: RxDocument<any>[];
  sort?: 'asc' | 'desc';
  query?: any;
};

export default ({ data, sort = 'desc', query }: PaginationSelector) => {
  const first_id = data[0] ? data[0].id : '';
  const last_id = data[data.length - 1] ? data[data.length - 1].id : '';
  let first_selector = undefined;
  let last_selector = undefined;

  if (first_id && last_id) {
    if (query) {
      first_selector = sort === 'desc' ? { id: { $gt: first_id }, ...query } : { id: { $lt: first_id }, ...query };
      last_selector = sort === 'desc' ? { id: { $lt: last_id }, ...query } : { id: { $gt: last_id }, ...query };
    } else {
      first_selector = sort === 'desc' ? { id: { $gt: first_id } } : { id: { $lt: first_id } };
      last_selector = sort === 'desc' ? { id: { $lt: last_id } } : { id: { $gt: last_id } };
    }
  }

  return {
    first_selector,
    last_selector,
  };
};
