import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { generateErrorResponse, generateSuccessResponse } from '../helpers/responseHelper';
import SecurityAsymmetricKey from '../models/securityasymmetrickey';

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

    // Ensure the payload is correctly typed
    const { iss: apiKey } = decodedToken.payload as jwt.JwtPayload & { iss: string };
    const key = await SecurityAsymmetricKey.findOne({ where: { APIKey: apiKey } });
    if (!key) {
      console.error('API key not found:', apiKey);
      return generateErrorResponse(res, '401000', 'Invalid API key');
    }

    jwt.verify(token, key.public_key, { algorithms: ['RS256'] }, (err, decoded) => {
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

export { verifyAccessToken };
