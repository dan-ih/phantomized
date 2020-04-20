import phantomize from './phantomize';

const phantomVersion = process.env.PHANTOM_VERSION;
if (!phantomVersion) {
  console.error('missing required environment variable PHANTOM_VERSION');
  process.exit(1);
}

phantomize({ version: phantomVersion }).then(
  (file) => console.log(`saved ${file}`),
  (err) =>
    process.nextTick(() => {
      throw err;
    })
);
