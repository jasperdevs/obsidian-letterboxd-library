const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const sandbox={URL, module:{exports:{}},require:(name)=>name==='obsidian'?{Plugin:class{},PluginSettingTab:class{},MarkdownRenderChild:class{},Notice:class{},requestUrl:()=>{}}:require(name)};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'main.js'),'utf8'),sandbox);
const {text,select,kind,parseRuntime,parseCsv,watchedFromZip}=sandbox.module.exports.core;
const films=[{title:'Zulu',year:2000,path:'/film/zulu/',runtime:90},{title:'A short, "yes"',year:1900,path:'/film/a/',runtime:40},{title:'Unknown',year:2026,path:'/film/u/',runtime:null}];
test('short boundary and unknown runtimes',()=>{
 assert.equal(kind({runtime:40}),'short');assert.equal(kind({runtime:41}),'movie');assert.equal(kind({runtime:null}),'unknown');assert.equal(kind({runtime:-1}),'unknown');
});
test('copy groups include titles and years only; both includes unknowns',()=>{
 assert.equal(text(films,'movie'),'Zulu (2000)');assert.equal(text(films,'short'),'A short, "yes" (1900)');
 assert.equal(text([...films,films[0]],'all'),'A short, "yes" (1900)\nUnknown (2026)\nZulu (2000)');
 assert.equal(text([],'all'),'');assert.equal(select(films,'all').length,3);
});
test('runtime parsing accepts hours, minutes, and old markup',()=>{
 assert.equal(parseRuntime('"duration":"PT1H49M"'),109);assert.equal(parseRuntime('"duration":"PT8M"'),8);
 assert.equal(parseRuntime('"duration":"PT2H"'),120);assert.equal(parseRuntime('40&nbsp;mins'),40);assert.equal(parseRuntime('challenge page'),null);
});
test('CSV quoted commas, escaped quotes, BOM and CRLF',()=>{
 const result=parseCsv('\uFEFFDate,Name,Year,Letterboxd URI\r\n2026-10-28,"A short, ""yes""",1900,https://boxd.it/Ab1\r\n');
 assert.equal(result[0].title,'A short, "yes"');assert.equal(result[0].year,1900);
 assert.throws(()=>parseCsv('Name,Year,Letterboxd URI\nx,2020,https://evil.example/'));
 assert.throws(()=>parseCsv('Name,Year,Letterboxd URI\n"bad,2020,https://boxd.it/a'));
 assert.throws(()=>parseCsv('Date,Name,Year,Letterboxd URI,Rating\n2026-10-28,x,2020,https://boxd.it/a,3'));
});
test('malformed ZIP is rejected',()=>assert.throws(()=>watchedFromZip(Buffer.from('not a zip'))));
if(process.env.LETTERBOXD_EXPORT) test('real export ZIP imports every watched row',()=>{
 const parsed=parseCsv(watchedFromZip(fs.readFileSync(process.env.LETTERBOXD_EXPORT)));
 assert.ok(parsed.length>0);assert.equal(new Set(parsed.map(f=>f.path)).size,parsed.length);
});
function pluginFixture() {
 const Plugin=sandbox.module.exports;
 const p=new Plugin();p.settings={username:'tester',notePath:'Letterboxd.md',showPosters:true};p.data={username:'tester',films:films.map(f=>({...f,metadataAt:new Date().toISOString()})),lastSync:'old'};p.blocks=new Set();p.syncing=false;p.redraw=()=>{};p.saveData=async()=>{};return p;
}
test('CSV import replaces membership and preserves cached runtimes',async()=>{
 const p=pluginFixture();
 await p.importFile({size:100,name:'watched.csv',text:async()=> 'Date,Name,Year,Letterboxd URI\n2026-10-28,Zulu,2000,https://boxd.it/abc\n'});
 assert.equal(p.data.films.length,1);assert.equal(p.data.films[0].runtime,90);assert.equal(p.data.films[0].path,'/film/zulu/');assert.equal(p.syncing,false);
});
test('invalid imports keep the saved library intact',async()=>{
 const p=pluginFixture(),before=JSON.stringify(p.data);
 await p.importFile({size:100,name:'watched.csv',text:async()=> 'invalid'});
 assert.equal(JSON.stringify(p.data),before);assert.equal(p.syncing,false);assert.match(p.error,/watched.csv/);
});
test('failed save keeps the saved library intact',async()=>{
 const p=pluginFixture(),before=JSON.stringify(p.data);p.saveData=async()=>{throw new Error('disk full');};
 await p.importFile({size:100,name:'watched.csv',text:async()=> 'Name,Year,Letterboxd URI\nZulu,2000,https://boxd.it/abc'});
 assert.equal(JSON.stringify(p.data),before);assert.match(p.error,/disk full/);
});
test('blocked live refresh leaves the cached list usable',async()=>{
 const p=pluginFixture(),before=JSON.stringify(p.data);p.fetchPage=async()=>{throw new Error('HTTP 403');};
 await p.refresh();assert.equal(JSON.stringify(p.data),before);assert.equal(p.syncing,false);assert.equal(text(p.data.films,'movie'),'Zulu (2000)');assert.match(p.error,/403/);
});
const {parseMetadata,smallPoster,stats,validUsername,filmUrl,exportData}=sandbox.module.exports.core;
test('metadata parser reads real Letterboxd structured data and a small poster',()=>{
 const html='<script type="application/ld+json">/* <![CDATA[ */{"@type":"Movie","image":"https://a.ltrbxd.com/resized/film-poster/x-0-600-0-900-crop.jpg","aggregateRating":{"ratingValue":3.74}}/* ]]> */</script>"duration":"PT1H20M"';
 const meta=parseMetadata(html);assert.equal(meta.average,3.74);assert.equal(meta.runtime,80);assert.match(meta.poster,/-0-70-0-105-crop.jpg$/);
 assert.throws(()=>parseMetadata('blocked'));
});
test('external image and film URLs are restricted',()=>{
 assert.equal(smallPoster('javascript:alert(1)'),null);assert.equal(smallPoster('https://evil.example/a.jpg'),null);
 assert.equal(smallPoster('https://a.ltrbxd.com.evil.example/a.jpg'),null);
 assert.equal(filmUrl({path:'javascript:alert(1)'}),null);assert.equal(filmUrl({path:'/film/arrival/'}),'https://letterboxd.com/film/arrival/');
});
test('usernames accept handles and reject paths',()=>{
 assert.equal(validUsername(' @Other_User '),'other_user');assert.equal(validUsername(''),'');
 assert.throws(()=>validUsername('../other'));assert.throws(()=>validUsername('https://letterboxd.com/example/'));
});
test('statistics count unique films and omit unrated films from average',()=>{
 const result=stats([...films,{...films[0],rating:4}, {...films[1],rating:2}]);
 assert.equal(result.total,3);assert.equal(result.movies,1);assert.equal(result.shorts,1);assert.equal(result.unknown,1);
 assert.equal(result.hours,130/60);assert.equal(result.rated,2);assert.equal(result.average,3);
 assert.equal(result.decades.reduce((sum,[,n])=>sum+n,0),3);assert.equal(result.ratings.reduce((sum,[,n])=>sum+n,0),2);
 assert.equal(stats([]).average,null);
});
test('switching username does not display the previous account library',async()=>{
 const p=pluginFixture();assert.equal(p.activeFilms().length,3);await p.saveSettings({username:'other_user'});assert.equal(p.activeFilms().length,0);
 assert.equal(p.data.films.length,3);
});
if(process.env.LETTERBOXD_EXPORT) test('full export includes profile handle and personal ratings',()=>{
 const result=exportData(fs.readFileSync(process.env.LETTERBOXD_EXPORT));assert.ok(result.username);assert.equal(result.films.length,parseCsv(watchedFromZip(fs.readFileSync(process.env.LETTERBOXD_EXPORT))).length);
 assert.ok(result.films.filter(f=>f.rating!=null).every(f=>f.rating>=.5 && f.rating<=5));
});
const {filterFilms}=sandbox.module.exports.core;
const sortable=[{title:'A',year:2020,path:'/film/a/',runtime:100,rating:4,average:3.5},{title:'B',year:1900,path:'/film/b/',runtime:10,rating:2,average:4.2},{title:'C',year:2000,path:'/film/c/',runtime:null,rating:null,average:null}];
test('ascending and descending sorts keep missing values last',()=>{
 for(const [sort,asc,desc] of [['title','ABC','CBA'],['year','BCA','ACB'],['runtime','BAC','ABC'],['rating','BAC','ABC'],['average','ABC','BAC']]) {
  assert.equal(filterFilms(sortable,{sort,direction:'asc'}).map(f=>f.title).join(''),asc);
  assert.equal(filterFilms(sortable,{sort,direction:'desc'}).map(f=>f.title).join(''),desc);
 }
});
test('category, rating, decade and search filters combine',()=>{
 assert.equal(filterFilms(sortable,{category:'movie',ratingFilter:'fourPlus',decade:'2020',query:' a '}).length,1);
 assert.equal(filterFilms(sortable,{ratingFilter:'unrated'})[0].title,'C');
 assert.equal(filterFilms(sortable,{ratingFilter:'rating:2'})[0].title,'B');
 assert.equal(filterFilms(sortable,{category:'short',ratingFilter:'fourPlus'}).length,0);
 assert.equal(filterFilms(sortable,{ratingFilter:'rated'}).length,2);
});
test('extended stats handle missing and empty data without invalid numbers',()=>{
 const result=stats(sortable);assert.equal(result.averageRuntime,55);assert.equal(result.runtimeCount,2);assert.equal(result.longest.title,'A');assert.equal(result.shortest.title,'B');
 assert.equal(result.oldest.title,'B');assert.equal(result.newest.title,'A');assert.equal(result.median,3);assert.equal(result.fourPlus,1);assert.equal(result.fiveStars,0);
 const empty=stats([]);assert.equal(empty.averageRuntime,null);assert.equal(empty.oldest,null);assert.equal(empty.longest,null);assert.equal(empty.median,null);
});
test('fresh installation has no preset username, note location or film data',async()=>{
 const p=new sandbox.module.exports();p.loadData=async()=>null;
 for(const name of ['addSettingTab','registerMarkdownCodeBlockProcessor','addCommand','addRibbonIcon'])p[name]=()=>{};
 await p.onload();assert.equal(p.settings.username,'');assert.equal(p.settings.notePath,'Letterboxd.md');assert.equal(p.activeFilms().length,0);
});
function clipboardFixture() {
 const p=pluginFixture(),copies=[];
 sandbox.navigator={clipboard:{writeText:async value=>copies.push(value)}};
 return {p,copies};
}
test('copy awaits refresh and uses the refreshed library',async()=>{
 const {p,copies}=clipboardFixture();let finish;
 p.refresh=()=>new Promise(resolve=>{finish=()=>{p.data.films=[{title:'Fresh',year:2026,path:'/film/fresh/',runtime:90}];resolve(true);};});
 const pending=p.copyFilms('movie');assert.equal(copies.length,0);assert.equal(p.copying,true);
 finish();assert.equal(await pending,true);assert.equal(copies[0],'Fresh (2026)');assert.equal(p.copying,false);
});
test('copy falls back to saved films when Letterboxd blocks refresh',async()=>{
 const {p,copies}=clipboardFixture();p.fetchPage=async()=>{throw new Error('HTTP 403');};
 assert.equal(await p.copyFilms('short'),true);assert.equal(copies[0],'A short, "yes" (1900)');assert.match(p.error,/403/);assert.equal(p.copying,false);
});
test('disabled refresh-before-copy copies immediately without requesting refresh',async()=>{
 const {p,copies}=clipboardFixture();p.settings.refreshBeforeCopy=false;p.refresh=()=>{throw new Error('Unexpected refresh');};
 assert.equal(await p.copyFilms('movie'),true);assert.equal(copies[0],'Zulu (2000)');
});
test('copy waits for an existing refresh and does not start another',async()=>{
 const {p,copies}=clipboardFixture();let finish,runs=0;
 p.refreshLibrary=()=>{runs++;p.syncing=true;return new Promise(resolve=>{finish=()=>{p.syncing=false;resolve(true);};});};
 const refresh=p.refresh();const copy=p.copyFilms('all');assert.equal(runs,1);assert.equal(copies.length,0);
 finish();await refresh;await copy;assert.equal(copies.length,1);assert.equal(p.refreshPromise,null);
});
test('copy ignores duplicate clicks and remains available after clipboard failure',async()=>{
 const {p}=clipboardFixture();let finish;
 p.refresh=()=>new Promise(resolve=>{finish=()=>resolve(true);});
 sandbox.navigator.clipboard.writeText=async()=>{throw new Error('Clipboard denied');};
 const pending=p.copyFilms('all');assert.equal(await p.copyFilms('all'),false);finish();
 assert.equal(await pending,false);assert.equal(p.copying,false);
});
test('copy does not race an export import',async()=>{
 const {p,copies}=clipboardFixture();p.syncing=true;
 assert.equal(await p.copyFilms('all'),false);assert.equal(copies.length,0);
});
const {releaseDate,releaseLabel,libraryCsv}=sandbox.module.exports.core;
const dated=[{...sortable[0],title:'Early',releaseDate:'2020-01-31'},{...sortable[1],title:'Late',year:2020,releaseDate:'2020-12-01'}];
test('oldest and newest compare months and days within the same year',()=>{
 const result=stats(dated);assert.equal(result.oldest.title,'Early');assert.equal(result.newest.title,'Late');
 assert.equal(filterFilms(dated,{sort:'year',direction:'desc'})[0].title,'Late');
 assert.equal(filterFilms(dated,{sort:'year',direction:'asc'})[0].title,'Early');
 assert.match(releaseLabel(dated[0]),/2020/);assert.notEqual(releaseLabel(dated[0]),'2020');
});
test('partial and impossible dates do not become invented full dates',()=>{
 assert.equal(releaseDate('2020'),null);assert.equal(releaseDate('2020-03'),null);assert.equal(releaseDate('2020-02-30'),null);
 assert.equal(releaseDate('2020-02-29'),'2020-02-29');assert.equal(releaseLabel({year:2020}),'2020');
 assert.equal(stats(sortable).partialReleaseDates,3);
});
test('CSV export includes every unique film with ratings, links and properly escaped text',()=>{
 const csv=libraryCsv([...films,films[0]]);
 assert.equal(csv.split('\r\n').filter(Boolean).length,4);assert.match(csv,/"A short, ""yes"""/);assert.match(csv,/https:\/\/letterboxd.com\/film\/zulu\//);
 assert.match(libraryCsv([{title:'=FORMULA()',year:2020,path:'/film/x/',runtime:1}]),/"'=FORMULA\(\)"/);
 assert.match(libraryCsv([{...dated[0],rating:4,average:3.5}]),/"2020-01-31"/);
});
test('export saves the whole cached list while sync is running and avoids overwriting files',async()=>{
 const p=pluginFixture();p.syncing=true;const saved=[];
 p.app={vault:{getAbstractFileByPath:path=>!path.includes('(2)'),create:async(path,content)=>saved.push({path,content})}};
 const file=await p.exportLibrary();assert.match(file,/\(2\)\.csv$/);assert.equal(saved.length,1);assert.equal(saved[0].content.split('\r\n').filter(Boolean).length,4);assert.equal(p.exporting,false);
});
test('failed export clears its busy state and preserves the library',async()=>{
 const p=pluginFixture(),before=JSON.stringify(p.data);p.app={vault:{getAbstractFileByPath:()=>null,create:async()=>{throw new Error('disk full');}}};
 assert.equal(await p.exportLibrary(),null);assert.equal(p.exporting,false);assert.equal(JSON.stringify(p.data),before);
});
