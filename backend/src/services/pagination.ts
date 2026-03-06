export interface PaginationParams {
  page?: string | number;
  limit?: string | number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  skip: number;
}

export function getPagination(params: PaginationParams): PaginationMeta {
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = Math.max(Number(params.limit) || 10, 1);

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip
  };
}
