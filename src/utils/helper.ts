export const getPaginationLinks = (
  page: number,
  totalPages: number,
  path: string,
): PaginatedLinks[] => {
  const links = [
    {
      url: page > 1 ? `${path}?page=${page - 1}` : null,
      label: '&laquo; Previous',
      active: false,
    },
    {
      url: `${path}?page=${page}`,
      label: `${page}`,
      active: true,
    },
    {
      url: page < totalPages ? `${path}?page=${page + 1}` : null,
      label: 'Next &raquo;',
      active: false,
    },
  ];

  return links;
};
