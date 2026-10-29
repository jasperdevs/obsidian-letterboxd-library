const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

test('release builds from source after every main.js file is removed',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'letterboxd-clean-build-'));
  try {
    fs.mkdirSync(path.join(temp,'src'));
    fs.copyFileSync(path.join(__dirname,'src/plugin.cjs'),path.join(temp,'src/plugin.cjs'));
    fs.copyFileSync(path.join(__dirname,'src/inflate.mjs'),path.join(temp,'src/inflate.mjs'));
    fs.copyFileSync(path.join(__dirname,'build.mjs'),path.join(temp,'build.mjs'));
    fs.mkdirSync(path.join(temp,'node_modules'));
    for(const name of ['esbuild','@esbuild'])fs.symlinkSync(path.join(__dirname,'node_modules',name),path.join(temp,'node_modules',name),'dir');
    fs.cpSync(path.join(__dirname,'node_modules/fflate'),path.join(temp,'node_modules/fflate'),{recursive:true});
    execFileSync(process.execPath,[path.join(temp,'build.mjs')],{cwd:temp});
    assert.deepEqual(fs.readFileSync(path.join(temp,'main.js')),fs.readFileSync(path.join(__dirname,'main.js')));
  } finally {fs.rmSync(temp,{recursive:true,force:true});}
});
