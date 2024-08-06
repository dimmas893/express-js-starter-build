import { Request, Response } from 'express';
import SecurityAsymmetricKey from '../../models/securityasymmetrickey';
import { generateKeyPair, hashSecret, saveKeyToFile, validateSecret } from '../../Helpers/cryptoHelper';
import ResponseHelper from '../../Helpers/responseHelper';
import { OK, UNAUTHORIZED, SERVER_GENERAL_ERROR } from '../../Helpers/responseCode';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const generateAsymmetricKey = async (req: Request, res: Response) => {
  try {
    const { publicKey, privateKey } = generateKeyPair();
    const apiKey = crypto.randomUUID(); 
    const secret = crypto.randomBytes(20).toString('hex');
    const hashedSecret = await hashSecret(secret);

    await SecurityAsymmetricKey.create({
      api_key: apiKey,
      private_key: privateKey,
      public_key: publicKey,
      secret: hashedSecret,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await saveKeyToFile(privateKey, `storage/credentials/${apiKey}/private.key`);
    await saveKeyToFile(publicKey, `storage/credentials/${apiKey}/public.key`);
    await saveKeyToFile(hashedSecret, `storage/credentials/${apiKey}/secret.key`);

    ResponseHelper.generate(res, OK, { items: { privateKey, publicKey, secret, apiKey } });
  } catch (error) {
    console.error('Error generating asymmetric key:', error);
    ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
  }
};

const generateAccessToken = async (req: Request, res: Response) => {
  try {
    const { api_key, secret, audience, private_key } = req.body;
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

const verifyAccessToken = async (req: Request, res: Response) => {
  try {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) {
      return ResponseHelper.generate(res, UNAUTHORIZED, {}, 'No token provided');
    }

    const decodedToken = jwt.decode(token, { complete: true }) as jwt.Jwt | null;
    if (!decodedToken || typeof decodedToken.payload !== 'object') {
      return ResponseHelper.generate(res, UNAUTHORIZED, {}, 'Invalid token');
    }

    const { iss: apiKey } = decodedToken.payload as jwt.JwtPayload & { iss: string };
    const key = await SecurityAsymmetricKey.findOne({ where: { api_key: apiKey } });
    if (!key) {
      console.error('API key not found:', apiKey);
      return ResponseHelper.generate(res, UNAUTHORIZED, {}, 'Invalid API key');
    }

    jwt.verify(token, key.public_key, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        console.error('Error verifying access token:', err);
        return ResponseHelper.generate(res, UNAUTHORIZED, {}, 'Invalid token');
      }
      ResponseHelper.generate(res, OK, { data: decoded });
    });
  } catch (err) {
    console.error('Error verifying access token:', err);
    ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (err as Error).message);
  }
};

const getCredential = async (req: Request, res: Response) => {
  try {
    const { api_key } = req.body;

    const key = await SecurityAsymmetricKey.findOne({ where: { api_key: api_key } });
    if (!key) {
      return ResponseHelper.generate(res, UNAUTHORIZED, {}, 'API key not found');
    }

    ResponseHelper.generate(res, OK, {
      secret: key.secret,
      publicKey: key.public_key,
      privateKey: key.private_key,
    });
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
  }
};

export {
  generateAsymmetricKey,
  generateAccessToken,
  verifyAccessToken,
  getCredential
};
