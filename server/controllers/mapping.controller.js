import httpStatus from 'http-status';
import APIError from '../helpers/api.error';
import storage from '../helpers/storage';

function getMappings(req, res, next) {
  const repo = req.query.repo;
  const files = req.query.files;

  const retrieveMappings = () => {
    if (!req.query.files) return storage.store.getHash(repo);
    const retrieval = [];
    const filesArray = files.split(',');
    filesArray.forEach((file) => {
      retrieval.push(storage.store.getMapping(repo, file));
    });
    return Promise.all(retrieval);
  };

  const response = mappings => res.json(mappings);

  return retrieveMappings()
    .then(response)
    .catch(next);
}

function setMappings(req, res, next) {
  const repo = req.query.repo;
  const mappings = req.query.data;
  const err = new APIError('Invalid use of resource.', httpStatus.BAD_REQUEST);
  if (!mappings) return next(err);

  const response = () => res.status(httpStatus.OK);

  return storage.store.setHash(repo, JSON.parse(mappings))
    .then(response)
    .catch(next);
}

function deleteMapping(req, res, next) {
  const repo = req.query.repo;
  const file = req.query.file;
  const err = new APIError('Invalid use of resource.', httpStatus.BAD_REQUEST);
  if (!file) return next(err);

  const response = () => res.status(httpStatus.OK);

  return storage.store.removeMapping(repo, file)
    .then(response)
    .catch(next);
}

export default { getMappings, setMappings, deleteMapping };
