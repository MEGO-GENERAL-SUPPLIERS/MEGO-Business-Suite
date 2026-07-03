import { Router } from 'express';
import { refresh } from '../controllers/auth/AuthController.js';
import { authMiddleware } from '../middleware/auth.js';
import { get, update, uploadCompany } from '../controllers/private/companyController.js';
import { getCountries } from '../controllers/private/countryController.js';
import { uploadLogoMiddleware } from '../middleware/upload.js';

const router = Router();

router.post('/refresh', refresh);

router.get('/auth/user', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      userId: (req as any).user.userId,
      username: (req as any).user.username,
      sessionId: (req as any).user.sessionId
    }
  });
});

router.get('/company-info', get);
router.put('/company-info', update);
router.post('/company-info/logo', uploadLogoMiddleware.single('logo'), uploadCompany);

router.get('/countries', getCountries);

export default router;