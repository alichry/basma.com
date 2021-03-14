import express from 'express';
import { userRegistrationSchema } from '../user/schemas';
import { createUser, getUsers, verifyUser } from '../user/service';
import { handleException } from '../utils';
import { authMiddleware } from '../auth';
import createLimiter from '../createLimiter';

const router = express.Router();

router.post('/', createLimiter(), (req, res) => {
  const host = req.headers.host;
  userRegistrationSchema.validate(req.body)
    .then(userRegistration => {
      if (! host) {
        res.status(400);
        res.json({
          message: "Missing Host header in request"
        });
        return;
      }
      return createUser(host, userRegistration);
    })
    .then(user => {
      res.json({
        id: user?.id,
        firstname: user?.firstname,
        lastname: user?.lastname,
        email: user?.email
      });
    })
    .catch(err => handleException(res, err));
});

router.get('/', authMiddleware, (req, res) => {
  getUsers()
    .then((users) => {
      res.json(users);
      res.end();
    })
    .catch(err => handleException(res, err));
})

router.post('/verify/:token', (req, res) => {
  const token: string | undefined = req.params.token;
  if (! token) {
    res.status(400).json({ message: "Malformed request"});
    return;
  }
  verifyUser(token)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => handleException(res, err));
});

export default router;