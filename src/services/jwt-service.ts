import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
import {MyUserProfile} from './user.service';
// import {TokenServiceBindings} from '../keys';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService {
  // @inject('authentication.jwt.secret')
  @inject(TokenServiceBindings.TOKEN_SECRET)
  public readonly jwtSecret: string;

  @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
  public readonly expiresSecret: string;

  async generateToken(userProfile: MyUserProfile): Promise<string> {
    if (!userProfile) {
      throw new Error(
        'Error while generating token :userProfile is null'
      )
    }
    let token = '';
    try {
      token = await signAsync({
        id: userProfile[securityId],
        username: userProfile.username,
        role: userProfile.role
      }, this.jwtSecret, {
        expiresIn: this.expiresSecret
      });
      return token;
    } catch (err) {
      throw new Error(
        `error generating token ${err}`
      )
    }
  }

  async verifyToken(token: string): Promise<UserProfile> {

    if (!token) {
      throw Error(
        `Error verifying token:'token' is null`
      )
    };

    let userProfile: UserProfile;
    try {
      const decryptedToken = await verifyAsync(token, this.jwtSecret);
      userProfile = Object.assign(
        {[securityId]: '', id: '', name: ''},
        {
          [securityId]: decryptedToken.id,
          id: decryptedToken.id,
          name: decryptedToken.name,
          lastname: decryptedToken.lastname,
          firstname: decryptedToken.firstname,
          role: decryptedToken.role
        }
      );
    }
    catch (err) {
      throw new Error(`Error verifying token`)
    }
    console.log(userProfile);
    return userProfile;
  }
}

