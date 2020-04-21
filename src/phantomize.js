import * as tar from 'tar';
import * as tmp from 'tmp-promise';
import execa from 'execa';
import got from 'got';
import unbzip2 from 'unbzip2-stream';
import { dirname } from 'path';
import { pipeline } from 'stream';
import { promises as fs } from 'fs';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

/**
 * Recursive rmdir.
 */
async function rmdirr(deepDir, makeFull = (path) => path) {
  for (let dir = deepDir; dir && dir[0] !== '.'; dir = dirname(dir)) {
    try {
      await fs.rmdir(makeFull(dir));
    } catch (err) {
      if (err.code === 'ENOTEMPTY') break;
    }
  }
}

const logger = (prefix) => (message) => console.log(`[${prefix}]`, message);

const defaultLogger = {
  debug() {},
  info: logger('info'),
  warning: logger('warning'),
  error: logger('error'),
};

async function phantomize({
  logger: log = defaultLogger,
  outputFile = './dockerized-phantomjs.tar.gz',
  version: phantomVersion = '2.1.1',
  workDir,
}) {
  if (typeof workDir !== 'string') {
    log.error('valid workDir not found');
    throw new Error('valid workDir not found');
  }

  log.info(`downloading phantomjs ${phantomVersion}`);

  const downloadURL = `https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-${phantomVersion}-linux-x86_64.tar.bz2`;
  const binaryFile = `phantomjs-${phantomVersion}-linux-x86_64/bin/phantomjs`;

  const workOut = `${workDir}/dockerized-phantomjs`;

  await pipelineAsync(
    got.stream(downloadURL),
    unbzip2(),
    tar.extract({ cwd: workDir }, [binaryFile])
  );
  await fs.rename(`${workDir}/${binaryFile}`, '/usr/local/bin/phantomjs');
  await rmdirr(dirname(binaryFile), (path) => `${workDir}/${path}`);

  log.info('running dockerize');
  await execa('dockerize', [
    '-n',
    '-o',
    workOut,
    ...`-e /usr/local/bin/phantomjs \
    -a /bin/dash /bin/sh \
    -a /etc/fonts /etc \
    -a /etc/ssl /etc \
    -a /usr/share/fonts /usr/share \
    --verbose \
    /usr/local/bin/phantomjs \
    /usr/bin/curl`.split(/\s+/g),
  ]);

  await Promise.all([
    fs.unlink(`${workOut}/Dockerfile`),
    fs.unlink(`${workOut}/usr/local/bin/phantomjs`),
  ]);

  log.info('creating tarball');
  await tar.create(
    {
      cwd: workOut,
      file: outputFile,
      gzip: true,
      portable: true,
    },
    ['./etc/fonts', './lib', './lib64', './usr/lib', './usr/share/fonts']
  );

  log.info('done');
  return outputFile;
}

export default function wrappedPhantomize(options) {
  return tmp.withDir(({ path }) => phantomize({ ...options, workDir: path }), {
    unsafeCleanup: true,
  });
}
