import { Router } from 'express';
import {
  getConversations,
  downloadConversations,
} from '../controllers/conversationController';

const router = Router();

router.get('/', getConversations);
router.get('/download', downloadConversations);

export default router;