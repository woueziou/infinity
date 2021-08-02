import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Principal, securityId} from '@loopback/security';
import {compare, genSalt, hash} from 'bcryptjs';
import _ from 'lodash';
import {Role, User, UserWithRelations} from '../models';
import {UserRepository} from '../repositories';
import {NewUserRequest} from './request/user';


export interface MyUserProfile extends Principal {
  username?: string;
  name?: string;
  role?: string;
}
export type Credentials = {
  identity: string;
  password: string;
};
@injectable({scope: BindingScope.TRANSIENT})
export class UserService {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    /* Add @inject to inject parameters */) { }
  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';
    const foundUser = await this.userRepository.findOne({
      where: {username: credentials.identity},
      include: ['userCredential', 'userRole']
    });

    if (!foundUser) {
      throw new Error(invalidCredentialsError);
    }

    const userCredential = foundUser.userCredential;
    if (!userCredential) {
      throw new Error(invalidCredentialsError);
    }
    const passMatched = await compare(
      credentials.password,
      userCredential.password
    );
    if (!passMatched) {
      throw new Error(invalidCredentialsError);
    }
    return foundUser;
  }
  convertToUserProfile(user: User): MyUserProfile {
    console.log(user.userRole.roleId);
    const role = user.userRole.roleId.toString();
    return {
      [securityId]: user.id!,
      name: user.firstname,
      username: user.username,
      id: user.id,
      role: role
    };
  }

  async findUserById(id: string): Promise<User & UserWithRelations> {
    const userNotfound = 'invalid User';
    const foundUser = await this.userRepository.findOne({
      where: {id: id},
    });

    if (!foundUser) {
      throw new Error(userNotfound);
    }
    return foundUser;
  }


  async createUser(user: NewUserRequest, role: typeof Role.prototype.id): Promise<User & UserWithRelations> {
    const foundUserName = await this.userRepository.findOne({where: {username: user.username}});
    if (foundUserName) {
      throw new Error("Cet nom d'utilisateur est indisponible");

    }
    const userCreated = await this.userRepository.create(_.omit(user, 'password'));

    const password = await hash(user.password, await genSalt());
    await this.userRepository.userCredential(userCreated.id).create({password: password});
    await this.userRepository.userRole(userCreated.id).create({roleId: role});
    return userCreated;
  }
  /*
   * Add service methods here
   */
}


