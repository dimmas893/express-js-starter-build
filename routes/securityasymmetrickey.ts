import { Router } from 'express';
import {
  generateAsymmetricKey,
  generateAccessToken,
  verifyAccessToken,
  getCredential
} from '../app/Http/controllers/securityController';

const router = Router();

router.post('/generate-asymmetric-key', generateAsymmetricKey);
router.post('/generate-access-token', generateAccessToken);
router.post('/verify-access-token', verifyAccessToken);
router.post('/get-credential', getCredential);

export default router;
