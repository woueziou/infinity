/* eslint-disable @typescript-eslint/no-explicit-any */
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-todo-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {authenticate} from '@loopback/authentication';
import {
  TokenServiceBindings
} from '@loopback/authentication-jwt';
import {authorize} from '@loopback/authorization';
import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  oas,
  post,
  requestBody,
  Response,
  RestBindings,
  SchemaObject
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {basicAuthorization} from '../middlewares/auth.mid';
import {User} from '../models';
import {ADMIN_ROLE_KEY} from '../observers';
import {RoleRepository, UserRepository} from '../repositories';
import {Credentials, UserService} from '../services';
import {JWTService} from '../services/jwt-service';
import {NewUserRequest} from '../services/request/user';


const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['identity', 'password'],
  properties: {
    identity: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

@oas.api({basePath: "auth"})
export class UserController {
  constructor(
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    // @inject(TokenServiceBindings.TOKEN_SERVICE)    public jwtService: TokenService,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: JWTService,
    @service(UserService) public userService: UserService,
    // @inject(SecurityBindings.USER) public userProfile: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(RoleRepository) protected roleRepository: RoleRepository,
  ) { }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: string}> {
    try {
      // ensure the user exists, and the password is correct
      const user = await this.userService.verifyCredentials(credentials);
      // convert a User object into a UserProfile object (reduced set of properties)
      const userProfile = this.userService.convertToUserProfile(user);

      // create a JSON Web Token based on the user profile
      const token = await this.jwtService.generateToken(userProfile);
      return {token};
    } catch (error: any) {
      throw this.response.status(401).send(error.message);
    }

  }


  @get('/whoAmI', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [ADMIN_ROLE_KEY], voters: [basicAuthorization]})
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<string> {
    return currentUserProfile[securityId];
  }

  @post('/signup')
  @oas.response(200, User)
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
            exclude: ['id']
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<any> {
    // const password = await hash(newUserRequest.password, await genSalt());
    const role = await this.roleRepository.findOne({where: {name: "ADMIN"}});
    try {
      const savedUser = await this.userService.createUser(
        newUserRequest, role?.key
      );
      return savedUser;
    } catch (error: any) {
      throw this.response.status(401).send(error.message);
    }

  }
}
