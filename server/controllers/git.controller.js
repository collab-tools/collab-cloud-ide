import httpStatus from 'http-status';
import APIError from '../helpers/api.error';
import github from '../helpers/github';

function getFileTree(req, res, next) {
  const owner = req.query.owner;
  const repo = req.query.repo;
  const retrieveTrees = (payload) => {
    if (!payload.commit.sha) {
      const err = new APIError('Branch Retrieval Error', httpStatus.UNAUTHORIZED);
      return next(err);
    }
    return github.gitdata.getTree({ owner, repo, sha: payload.commit.sha });
  };

  const response = payload => res.json(payload);

  github.authenticate({
    type: 'oauth',
    token: req.user.github_token,
  });

  return github.repos.getBranch({ owner, repo, branch: 'master' })
    .then(retrieveTrees)
    .then(response)
    .catch(next);
}

function getFile(req, res, next) {
  const owner = req.query.owner;
  const repo = req.query.repo;
  const path = req.query.path;
  const response = payload => res.json(payload);

  github.authenticate({
    type: 'oauth',
    token: req.user.github_token,
  });

  return github.repos.getContent({ owner, repo, path })
    .then(response)
    .catch(next);
}

function createFile(req, res, next) {
  const owner = req.query.owner;
  const repo = req.query.repo;
  const path = req.query.path;
  const message = req.query.message;
  const content = req.body.content;
  const encodedString = new Buffer(content).toString('base64');
  const response = payload => res.json(payload);

  github.authenticate({
    type: 'oauth',
    token: req.user.github_token,
  });

  return github.repos.createFile({ owner, repo, path, message, content: encodedString })
    .then(response)
    .catch(next);
}

function deleteFile(req, res, next) {
  const owner = req.query.owner;
  const repo = req.query.repo;
  const path = req.query.path;
  const message = req.query.message;
  const sha = req.query.sha;
  const response = payload => res.json(payload);

  github.authenticate({
    type: 'oauth',
    token: req.user.github_token,
  });

  return github.repos.deleteFile({ owner, repo, path, message, sha })
    .then(response)
    .catch(next);
}

// Helper endpoint to deterministically update or create the file to GitHub
function upsertFile(req, res, next) {
  const owner = req.query.owner;
  const repo = req.query.repo;
  const path = req.query.path;
  const message = req.query.message || `${path} updated from Cloud IDE`;
  const content = req.body.content;
  const encodedString = new Buffer(content).toString('base64');

  github.authenticate({
    type: 'oauth',
    token: req.user.github_token,
  });

  const upsertOpr = (masterFile) => {
    console.log('FUCK');
    console.log(masterFile);
    if (!masterFile) return github.repos.createFile({ owner, repo, path, message, content: encodedString });
    return github.repos.updateFile({ owner, repo, path, message, content: encodedString, sha: masterFile.sha });
  };

  const response = payload => res.json(payload);
  console.log('Kappa');
  return github.repos.getContent({ owner, repo, path })
    .then(upsertOpr)
    .then(response)
    .catch(next);
}

export default { getFileTree, getFile, createFile, deleteFile, upsertFile };
