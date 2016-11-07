import GitHub from 'github';

const libConfig = {
  debug: true,
  protocol: 'https',
  Promise,
};

export default new GitHub(libConfig);
