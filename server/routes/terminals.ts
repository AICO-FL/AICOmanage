import { Router } from 'express';
import multer from 'multer';
import {
  getTerminals,
  createTerminal,
  updateTerminal,
  deleteTerminal,
  handleMessage,
  handlePolling,
  forceSpeak,
  updateGreeting,
} from '../controllers/terminalController';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Terminal CRUD operations
router.get('/', getTerminals);
router.post('/', createTerminal);
router.put('/:id', updateTerminal);
router.delete('/:id', deleteTerminal);

// Terminal actions
router.post('/:id/message', upload.single('file'), handleMessage);
router.post('/:id/polling', handlePolling);
router.post('/:id/force-speak', forceSpeak);
router.post('/:id/greeting', updateGreeting);

export default router;