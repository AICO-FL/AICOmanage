import { Router } from 'express';
import {
  getClientFiles,
  getServerFiles,
  uploadServerFile,
  downloadFile,
  deleteFile,
  upload,
} from '../controllers/fileController';

const router = Router();

// Client files
router.get('/client', getClientFiles);
router.get('/client/:id/download', downloadFile);
router.delete('/client/:id', deleteFile);

// Server files
router.get('/server', getServerFiles);
router.post('/server', upload.single('file'), uploadServerFile);
router.get('/server/:id/download', downloadFile);
router.delete('/server/:id', deleteFile);

export default router;