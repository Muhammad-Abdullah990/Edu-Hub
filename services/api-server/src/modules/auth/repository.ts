import { usersRepository } from "../users/repository";

export const authRepository = {
  findUserByEmail: usersRepository.findAccessProfileByEmail,
  findUserById: usersRepository.findAccessProfileById,
  touchLastLogin: usersRepository.touchLastLogin,
};
