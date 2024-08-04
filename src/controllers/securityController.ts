import { Request, Response } from 'express';
import SecurityAsymmetricKey from '../../models/securityasymmetrickey';
import { generateKeyPair, hashSecret, saveKeyToFile } from '../helpers/cryptoHelper';
import { generateErrorResponse, generateSuccessResponse } from '../helpers/responseHelper';
import { validateSecret } from '../helpers/cryptoHelper';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

import {
  OK,
  UNAUTHORIZED,
  SERVER_GENERAL_ERROR,
} from '../helpers/responseCode';
dotenv.config();

const generateAsymmetricKey = async (req: Request, res: Response) => {
  try {
    const { publicKey, privateKey } = generateKeyPair();
    const apiKey = crypto.randomUUID(); // Note: `crypto.randomUUID` is available from Node.js v14.17.0 onwards.
    const secret = crypto.randomBytes(20).toString('hex');
    const hashedSecret = await hashSecret(secret);

    await SecurityAsymmetricKey.create({
      APIKey: apiKey,
      PrivateKey: privateKey,
      PublicKey: publicKey,
      Secret: hashedSecret,
    });

    await saveKeyToFile(privateKey, `logs/credentials/${apiKey}/private.key`);
    await saveKeyToFile(publicKey, `logs/credentials/${apiKey}/public.key`);
    await saveKeyToFile(hashedSecret, `logs/credentials/${apiKey}/secret.key`);


    generateSuccessResponse(res, OK, { privateKey, publicKey, secret, apiKey });
  } catch (error) {
    console.error('Error generating asymmetric key:', error);
    generateErrorResponse(res, '500000', (error as Error).message);
  }
};

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
      key.PrivateKey,
      { algorithm: 'RS256' }
    );

    console.log('Access token generated successfully:', { token });
    generateSuccessResponse(res, '200000', { token });
  } catch (error) {
    console.error('Error generating access token:', error);
    generateErrorResponse(res, '500000', (error as Error).message);
  }
};

const verifyAccessToken = async (req: Request, res: Response) => {
  try {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) {
      return generateErrorResponse(res, '401000', 'No token provided');
    }

    const decodedToken = jwt.decode(token, { complete: true }) as jwt.Jwt | null;
    if (!decodedToken || typeof decodedToken.payload !== 'object') {
      return generateErrorResponse(res, '401000', 'Invalid token');
    }

    const { iss: apiKey } = decodedToken.payload as jwt.JwtPayload & { iss: string };
    const key = await SecurityAsymmetricKey.findOne({ where: { APIKey: apiKey } });
    if (!key) {
      console.error('API key not found:', apiKey);
      return generateErrorResponse(res, '401000', 'Invalid API key');
    }

    jwt.verify(token, key.PublicKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        console.error('Error verifying access token:', err);
        return generateErrorResponse(res, '401000', 'Invalid token', err.message);
      }
      generateSuccessResponse(res, '200000', { data: decoded });
    });
  } catch (err) {
    console.error('Error verifying access token:', err);
    generateErrorResponse(res, '500000', (err as Error).message);
  }
};

const getCredential = async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    console.log('Request to get credentials for API key:', { apiKey });

    const key = await SecurityAsymmetricKey.findOne({ where: { APIKey: apiKey } });
    if (!key) {
      console.error('API key not found:', apiKey);
      return generateErrorResponse(res, '401000', 'API key not found');
    }

    console.log('Credentials retrieved successfully:', { secret: key.Secret, publicKey: key.PublicKey, privateKey: key.PrivateKey });
    generateSuccessResponse(res, '200000', {
      secret: key.Secret,
      publicKey: key.PublicKey,
      privateKey: key.PrivateKey,
    });
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    generateErrorResponse(res, '500000', (error as Error).message);
  }
};

export {
  generateAsymmetricKey,
  generateAccessToken,
  verifyAccessToken,
  getCredential
};
