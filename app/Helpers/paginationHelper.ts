interface PaginationOptions {
  where: object;
  limit: number;
  offset: number;
  order?: [string, string][];
}

const paginate = (model: any) => async (options: PaginationOptions) => {
  const { where, limit, offset, order } = options;
  const { rows, count } = await model.findAndCountAll({
    where,
    limit,
    offset,
    order,
  });
  return {
    data: rows,
    total: count,
    pageCount: Math.ceil(count / limit),
    page: Math.floor(offset / limit) + 1,
  };
};

const paginateArray = (data: any[], limit: number, page: number) => {
  const offset = (page - 1) * limit;
  const paginatedItems = data.slice(offset, offset + limit);

  return {
    data: paginatedItems,
    total: data.length,
    pageCount: Math.ceil(data.length / limit),
    page,
  };
};

export { paginate, paginateArray };
