import {Entity, hasOne, model, property} from '@loopback/repository';
import {UserCredential} from './user-credential.model';
import {UserRole} from './user-role.model';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  firstname: string;

  @property({
    type: 'string',
    required: true,
  })
  lastname: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @hasOne(() => UserCredential)
  userCredential: UserCredential;

  @hasOne(() => UserRole)
  userRole: UserRole;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
