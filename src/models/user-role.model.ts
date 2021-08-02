import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from './user.model';
import {Role} from './role.model';

@model()
export class UserRole extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;



  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Role)
  roleId: string;

  constructor(data?: Partial<UserRole>) {
    super(data);
  }
}

export interface UserRoleRelations {
  // describe navigational properties here
}

export type UserRoleWithRelations = UserRole & UserRoleRelations;
