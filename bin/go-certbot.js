#!/usr/bin/env node

const shell                     = require('shelljs');
const os                        = require('os');
const path                      = require('path');
const {runTopAsync,async}       = require('../lib/utils');
const {spawnIt}                 = async;


if (require.main === module) {
  runTopAsync(main);
}

async function main() {
  require('loud-rejection/register');
  require('exit-on-epipe');

  // Determine args
  let argv            = Array.from(process.argv);
  //console.log('args:', argv);

  let npxName         = argv.shift();   /* literally 'npx' */
  let certbotName     = argv.shift();   /* literally 'certbot' or maybe the repo */

  let auth_domain     = argv.shift();   /* example.com */
  let domains         = argv.shift();   /* subdomain.example.com */
  let email           = argv.shift();   /* somebody@somewhere.com */

  //console.log('params', {npxName, certbotName, auth_domain, domains, email});
  //console.log('params', {auth_domain, domains, email});

  const out_dir       = path.join(os.homedir(), '.go-certbot', 'certs');
  const config_dir    = path.join(out_dir, 'config');
  const work_dir      = path.join(out_dir, 'work');
  const logs_dir      = path.join(out_dir, 'logs');

  //console.log('dirs', {config_dir, work_dir, logs_dir});

  if (!auth_domain) {
    shell.echo('Need auth_domain');
    shell.echo('Usage: npx .../certbot auth_domain domains email');
    shell.exit(1);
  }

  if (!domains) {
    shell.echo('Need domains');
    shell.echo('Usage: npx .../certbot auth_domain domains email');
    shell.exit(1);
  }

  if (!email) {
    shell.echo('Need email');
    shell.echo('Usage: npx .../certbot auth_domain domains email');
    shell.exit(1);
  }

  if (!shell.which('certbot')) {
    shell.echo('This script requires certbot. (On Ubuntu, you can:)');
    shell.echo('');
    shell.echo(`sudo apt-add-repository -y ppa:certbot/certbot`);
    shell.echo(`sudo apt-get update`);
    shell.echo(`sudo apt-get install -y certbot`);

    shell.exit(1);
  }

  shell.mkdir('-p', config_dir, work_dir, logs_dir);

  const command       = 'certbot';
  const help_script   = path.join(__dirname, '..', 'lib', 'certbot-route53-auth-hook.js');

  const args = [
    'certonly', '--non-interactive', '--manual',

    '--manual-auth-hook',     `node ${help_script} UPSERT ${auth_domain}`,
    '--manual-cleanup-hook',  `node ${help_script} DELETE ${auth_domain}`,
    '--preferred-challenge',  'dns',
    '--config-dir',           config_dir,
    '--work-dir',             work_dir,
    '--logs-dir',             logs_dir,
    '--agree-tos',
    '--manual-public-ip-logging-ok',
    '--domains',              domains,
    '--email',                email,
  ];

  // console.log('cli: ', command, args);

  const result = await spawnIt(command, args);
  // console.log(result);

  return  result;
}



