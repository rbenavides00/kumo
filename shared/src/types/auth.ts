export type RegisterBody = {
  username: string;
  password: string;
};

export type LoginBody = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};
