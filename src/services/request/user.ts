import {model, property} from '@loopback/repository';
import {User} from '../../models';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}
