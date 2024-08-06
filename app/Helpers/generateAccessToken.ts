import { Request, Response } from 'express';
import SecurityAsymmetricKey from '../models/securityasymmetrickey';
import ResponseHelper from './responseHelper';
import { validateSecret } from './cryptoHelper';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import {
  OK,
  UNAUTHORIZED,
  SERVER_GENERAL_ERROR,
} from './responseCode';


const generateAccessToken = async (req: Request, res: Response) => {
  try {
    const { api_key, secret, audience, private_key } = req.body;
    console.log('Request to generate access token:', { api_key, secret, audience, private_key });

    if (!api_key) {
      console.error('API key is missing');
      return ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, 'API key is missing');
    }

    const key = await SecurityAsymmetricKey.findOne({ where: { api_key: api_key } });

    if (!key) {
      console.error('API key not found:', api_key);
      return ResponseHelper.generate(res, UNAUTHORIZED, {}, 'Invalid apiKey');
    }

    const isValid = await validateSecret(api_key, secret, private_key);
    if (!isValid) {
      console.error('Secret or private key does not match.');
      return ResponseHelper.generate(res, UNAUTHORIZED, {}, 'Invalid secret or private key');
    }

    const token = jwt.sign(
      {
        iss: api_key,
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomBytes(16).toString('hex'),
      },
      key.private_key,
      { algorithm: 'RS256' }
    );

    console.log('Access token generated successfully:', { token });
    ResponseHelper.generate(res, OK, { token });
  } catch (error) {
    console.error('Error generating access token:', error);
    ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
  }
};


export { generateAccessToken };
