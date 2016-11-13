import _ from 'lodash';
import config from 'config';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import APIError from '../helpers/api.error';
import Storage from '../helpers/storage';

const storage = new Storage();

function verify(req, res, next) {
  const authUser = req.user;
  const response = (payload) => {
    if (!payload) {
      const err = new APIError('Verification Error', httpStatus.UNAUTHORIZED);
      return next(err);
    }
    const user = _.head(payload);
    authUser.github_token = user.githubRefreshToken;
    authUser.google_token = user.googleRefreshToken;
    const token = jwt.sign(authUser, config.jwt_secret);
    return res.json({ token, user });
  };

  return storage.app.user.getUserWithProjects(authUser.user_id)
    .then(response)
    .catch(next);
}

export default { verify };
