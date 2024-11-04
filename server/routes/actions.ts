import { Router } from 'express';
import { getActions, createAction, updateAction, deleteAction } from '../controllers/actionController';

const router = Router();

router.get('/', getActions);
router.post('/', createAction);
router.put('/:id', updateAction);
router.delete('/:id', deleteAction);

export default router;