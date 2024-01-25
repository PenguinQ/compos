import { db } from '@database';

type HandlePaginationReturn = {
  first_page: boolean;
  last_page: boolean;
}

type HandlePaginationSelector = {
  first: object | undefined;
  last: object | undefined;
}

type HandlePagination = {
  collection: string;
  selector: HandlePaginationSelector;
  sort: object[];
}

export default async ({ collection, sort, selector }: HandlePagination): Promise<HandlePaginationReturn> => {
  let first_page = false;
  let last_page = false;

  if (selector.first && selector.last) {
    const queryFirst = await db[collection].find({ selector: selector.first, sort, limit: 1 }).exec();
    const queryLast = await db[collection].find({ selector: selector.last, sort, limit: 1 }).exec();

    first_page = queryFirst.length ? false : true;
    last_page = queryLast.length ? false : true;
  }

  return { first_page, last_page };
};
