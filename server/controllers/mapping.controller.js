import _ from 'lodash';
import httpStatus from 'http-status';
import APIError from '../helpers/api.error';
import Storage from '../helpers/storage';

const storage = new Storage();

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
    return Promise.all(retrieval).then(_.partial(_.zip, filesArray));
  };

  const response = mappings => res.json(_.fromPairs(mappings));

  return retrieveMappings()
    .then(response)
    .catch(next);
}

function setMappings(req, res, next) {
  const repo = req.query.repo;
  const mappings = req.body.mappings;
  const err = new APIError('Invalid use of resource.', httpStatus.BAD_REQUEST);
  if (!mappings) return next(err);
  const response = () => res.status(httpStatus.OK).end();

  return storage.store.setHash(repo, mappings)
    .then(response)
    .catch(next);
}

function deleteMapping(req, res, next) {
  const repo = req.query.repo;
  const file = req.query.file;
  const err = new APIError('Invalid use of resource.', httpStatus.BAD_REQUEST);
  if (!file) return next(err);
  const response = () => res.status(httpStatus.OK).end();

  return storage.store.removeMapping(repo, file)
    .then(response)
    .catch(next);
}

export default { getMappings, setMappings, deleteMapping };
