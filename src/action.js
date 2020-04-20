import * as core from '@actions/core';

import phantomize from './phantomize';

const outputDirectory = process.env.GITHUB_WORKSPACE;
if (!outputDirectory) {
  throw new Error('missing environment variable GITHUB_WORKSPACE');
}

phantomize({
  outputFile: `${outputDirectory}/dockerized-phantomjs.tar.gz`,
  logger: core,
  version: core.getInput('phantomjsVersion', { required: true }),
}).then(
  (file) => core.setOutput('artifact', file),
  (err) =>
    process.nextTick(() => {
      throw err;
    })
);
