import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getSystemUser,
  updateSystemUser,
} from '../controllers/userController';

const router = Router();

// AICO User routes
router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// System User routes
router.get('/system', getSystemUser);
router.put('/system', updateSystemUser);

export default router;