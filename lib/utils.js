
const os                        = require('os');
const util                      = require("util");
const { spawn, execSync }       = require('child_process');


module.exports.lsb_releaseX   = lsb_releaseX;
module.exports.runTopAsync    = runTopAsync;
module.exports.spawnIt        = spawnIt;

module.exports.async          = {};
module.exports.async.spawnIt  = util.promisify(spawnIt);


function runTopAsync(main, name='main') {
  (async () => {
    let   err, result;
    const mainResult = await main();

    if (Array.isArray(mainResult)) {
      [err, result] = mainResult;
    } else {
      [err, result] = [null, mainResult];
    }

    if (err) {
      return announceError(err);
    }

    if (!result) {
      result = mainResult;
    }

    //const message = sg.extract(result ||{}, 'finalMessage');
    //ARGV.i(`function ${name} finished:`, {result}, message);
  })().catch(err => {
    // Deal with the fact the chain failed
    console.error(`++++++++++++++++++++++ an error in ${name}`, err);
  });

  function announceError(err) {
    //ARGV.w(`Error in ${name}`, err);
    if ('code' in err) {
      process.exit(err.code);
    }
    return err;
  }
}

// --------------------------------------------------------------------------------------------------------------------
/**
 *  spawn the command.
 */
function spawnIt(command, args, callback) {

  let env     = Object.assign({}, process.env, {OS_DISTRO: os_distro, OS_RELEASE: os_release, OS_CODENAME: os_codename});

  const proc  = spawn(command, args, {env});

  proc.stdout.on('data', (data) => {
    //console.log(`stdout: ${data}`);
    console.log(''+ data);
  });

  proc.stderr.on('data', (data) => {
    //console.error(`stderr: ${data}`);
    console.error(''+ data);
  });

  proc.on('close', (code) => {
    callback(code);
  });
}

function lsb_releaseX(opts) {
  if (os.platform() === 'linux') {
    return ''+ execSync(`lsb_release ${opts}`);
  } if (os.platform() === 'darwin') {
    if (opts.indexOf('i') !== -1) {
      return clean(''+ execSync(`sw_vers -productName`));
    }

    let vers = ''+ execSync(`sw_vers -productVersion`);
    if (opts.indexOf('r') !== -1) {
      return clean(vers);
    }

    if (opts.indexOf('c') !== -1) {
      if (vers.startsWith('10.15')) { return 'Catalina'; }
      if (vers.startsWith('10.14')) { return 'Mojave'; }
      if (vers.startsWith('10.13')) { return 'High Sierra'; }
      if (vers.startsWith('10.12')) { return 'Sierra'; }
      if (vers.startsWith('10.11')) { return 'El Capitan'; }
      if (vers.startsWith('10.10')) { return 'Yosemite'; }
      if (vers.startsWith('10.9'))  { return 'Mavericks'; }
      if (vers.startsWith('10.8'))  { return 'Mountain Lion'; }
      if (vers.startsWith('10.7'))  { return 'Lion'; }
      if (vers.startsWith('10.6'))  { return 'Snow Leopard'; }
      if (vers.startsWith('10.5'))  { return 'Leopard'; }
      if (vers.startsWith('10.4'))  { return 'Tiger'; }
      if (vers.startsWith('10.3'))  { return 'Panther'; }
      if (vers.startsWith('10.2'))  { return 'Jaguar'; }
      if (vers.startsWith('10.1'))  { return 'Puma'; }
      if (vers.startsWith('10.0.')) { return 'Cheetah'; }

      return `${lsb_release('-is')} ${vers}`;
    }
  }

  function clean(str) {
    return str.split('\n')[0];
  }
}

