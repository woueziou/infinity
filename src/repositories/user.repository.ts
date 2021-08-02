import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {User, UserCredential, UserRelations, UserRole} from '../models';
import {RoleRepository} from './role.repository';
import {UserCredentialRepository} from './user-credential.repository';
import {UserRoleRepository} from './user-role.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {



  public readonly userCredential: HasOneRepositoryFactory<UserCredential, typeof User.prototype.id>;

  public readonly userRole: HasOneRepositoryFactory<UserRole, typeof User.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('UserRoleRepository') protected userRoleRepositoryGetter: Getter<UserRoleRepository>, @repository.getter('RoleRepository') protected roleRepositoryGetter: Getter<RoleRepository>, @repository.getter('UserCredentialRepository') protected userCredentialRepositoryGetter: Getter<UserCredentialRepository>,
  ) {
    super(User, dataSource);
    this.userRole = this.createHasOneRepositoryFactoryFor('userRole', userRoleRepositoryGetter);
    this.registerInclusionResolver('userRole', this.userRole.inclusionResolver);
    this.userCredential = this.createHasOneRepositoryFactoryFor('userCredential', userCredentialRepositoryGetter);
    this.registerInclusionResolver('userCredential', this.userCredential.inclusionResolver);

  }
}
