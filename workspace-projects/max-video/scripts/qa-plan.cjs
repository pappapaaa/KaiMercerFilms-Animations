const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const filename=path.resolve('src/Story.ts');
const compiled=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
const mod=new Module(filename,module);mod.filename=filename;mod.paths=module.paths;mod._compile(compiled,filename);
const {CAMS,SHOTS}=mod.exports;
const cuts=Object.values(CAMS).flatMap(keys=>keys.filter(k=>k.cut).map(k=>[k.f,k.f]));
fs.mkdirSync('outputs/qa',{recursive:true});
fs.writeFileSync('outputs/qa/shots.json',JSON.stringify({shots:SHOTS.map(s=>({id:s.id,a:s.startFrame,b:s.endFrameExclusive})),planned:[...cuts,[1202,1202],[2605,2605]]},null,2));
console.log('QA boundaries:',SHOTS.length,'beats;',cuts.length,'intra-beat cuts; 2 phone-screen changes.');
