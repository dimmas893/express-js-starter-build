import { Request, Response } from 'express';
import SecurityAsymmetricKey from '../models/securityasymmetrickey';
import { generateErrorResponse, generateSuccessResponse } from '../helpers/responseHelper';
import { validateSecret } from '../helpers/cryptoHelper';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

const generateAccessToken = async (req: Request, res: Response) => {
  try {
    const { apiKey, secret, audience, privateKey } = req.body;
    console.log('Request to generate access token:', { apiKey, secret, audience, privateKey });

    const key = await SecurityAsymmetricKey.findOne({ where: { APIKey: apiKey } });
    if (!key) {
      console.error('API key not found:', apiKey);
      return generateErrorResponse(res, '401000', 'Invalid apiKey');
    }

    const isValid = await validateSecret(apiKey, secret, privateKey);
    if (!isValid) {
      console.error('Secret or private key does not match.');
      return generateErrorResponse(res, '401000', 'Invalid secret or private key');
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
    generateSuccessResponse(res, '200000', { token });
  } catch (error) {
    console.error('Error generating access token:', error);
    generateErrorResponse(res, '500000', (error as Error).message);
  }
};

export { generateAccessToken };
