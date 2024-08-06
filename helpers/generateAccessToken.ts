import { Request, Response } from 'express';
import SecurityAsymmetricKey from '../models/securityasymmetrickey';
import ResponseHelper from '../helpers/responseHelper';
import { validateSecret } from '../helpers/cryptoHelper';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import {
  OK,
  UNAUTHORIZED,
  SERVER_GENERAL_ERROR,
} from '../helpers/responseCode';

const generateAccessToken = async (req: Request, res: Response) => {
  try {
    const { apiKey, secret, audience, privateKey } = req.body;
    console.log('Request to generate access token:', { apiKey, secret, audience, privateKey });

    const key = await SecurityAsymmetricKey.findOne({ where: { api_key: apiKey } });
    if (!key) {
      console.error('API key not found:', apiKey);
      return ResponseHelper.generate(res, UNAUTHORIZED, {}, 'Invalid apiKey');
    }

    const isValid = await validateSecret(apiKey, secret, privateKey);
    if (!isValid) {
      console.error('Secret or private key does not match.');
      return ResponseHelper.generate(res, UNAUTHORIZED, {}, 'Invalid secret or private key');
    }

    const token = jwt.sign(
      {
        iss: apiKey,
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
