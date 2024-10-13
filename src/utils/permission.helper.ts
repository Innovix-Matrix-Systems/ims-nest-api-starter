export const getAllPermissions = (): string[] => {
  return [
    //role module
    'role.view.all',
    'role.view',
    'role.create',
    'role.update',
    'role.delete',
    //user module
    'user.view.all',
    'user.view',
    'user.create',
    'user.update',
    'user.delete',
  ];
};

export const getUserPermissions = (): string[] => {
  return [
    'user.view.all',
    'user.view',
    'user.create',
    'user.update',
    'user.delete',
  ];
};
