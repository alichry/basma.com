import express from 'express';
import { createAdmin, getAdmins, authenticateAdmin } from '../admin/service';
import { adminRegisterSchema, adminLoginSchema } from '../admin/schemas';
import { handleException } from '../utils';
import { authMiddleware } from '../auth';
import createLimiter from '../createLimiter';
import { getS3Image } from '../user/service';

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  adminRegisterSchema.validate(req.body)
    .then(createAdmin)
    .then(admin => {
      res.json({
        id: admin.id,
        username: admin.username
      });
    })
    .catch(err => handleException(res, err));
});

router.get('/', authMiddleware, (req, res) => {
  getAdmins()
    .then((admins) => {
      res.json(admins);
    })
    .catch(err => handleException(res, err));
})

router.post('/login', createLimiter(), (req, res) => {
  adminLoginSchema.validate(req.body)
    .then(authenticateAdmin)
    .then(token => {
      res.json({
        token
      });
    })
    .catch(err => handleException(res, err));
});

router.get('/image/:key', authMiddleware, (req, res) => {
  const key: string | undefined = req.params.key;
  if (! key) {
    res.status(400).json({ message: "Malformed request"});
    return;
  }
  getS3Image(key)
    .then(o => res.json(o))
    .catch(e => handleException(res, e));
})

export default router;