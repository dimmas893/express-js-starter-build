import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import ResponseHelper from './responseHelper';
import SecurityAsymmetricKey from '../models/securityasymmetrickey';
import { OK, UNAUTHORIZED, SERVER_GENERAL_ERROR } from './responseCode';

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

export { verifyAccessToken };
