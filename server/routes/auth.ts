import { Router } from 'express';
import { login, validateToken } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/validate', validateToken);

export default router;