import httpStatus from 'http-status';
import APIError from '../helpers/api.error';
import storage from '../helpers/storage';

function verify(req, res, next) {
  const response = (user) => {
    if (!user) {
      const err = new APIError('Verification Error', httpStatus.UNAUTHORIZED);
      return next(err);
    }
    return res.json(user);
  };

  return storage.app.user.getUserWithProjects(req.user.user_id)
    .then(response)
    .catch(next);
}

export default { verify };
