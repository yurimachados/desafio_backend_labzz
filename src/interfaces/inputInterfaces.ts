export interface CreateUserInput {
  username: string;
  password: string;
  email: string;
}

export interface UpdateUserInput {
  username?: string;
  password?: string;
  email?: string;
}

export interface DeleteUserInput {
  id: number;
}
