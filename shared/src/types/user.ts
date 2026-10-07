export type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  hasAvatar: boolean;
};

export type CurrentUser = User & {
  createdAt: string;
};

export type UpdateProfileBody = {
  firstName: string;
  lastName: string;
};

export type UpdatePasswordBody = {
  currentPassword: string;
  newPassword: string;
};
