const { Plugin, PluginSettingTab, Setting, Menu, Modal, MarkdownRenderChild, Notice, requestUrl, setIcon } = require('obsidian');
const DEFAULT_SETTINGS = { username: '', notePath: 'Letterboxd.md', showPosters: true, refreshBeforeCopy: true };
const LOGO = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNTAwcHgiIGhlaWdodD0iNTAwcHgiIHZpZXdCb3g9IjAgMCA1MDAgNTAwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA1Mi4yICg2NzE0NSkgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+bGV0dGVyYm94ZC1kZWNhbC1kb3RzLXBvcy1yZ2I8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz4KICAgICAgICA8cmVjdCBpZD0icGF0aC0xIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTI5Ljg0NzMyOCIgaGVpZ2h0PSIxNDEuMzg5MzEzIj48L3JlY3Q+CiAgICAgICAgPHJlY3QgaWQ9InBhdGgtMyIgeD0iMCIgeT0iMCIgd2lkdGg9IjEyOS44NDczMjgiIGhlaWdodD0iMTQxLjM4OTMxMyI+PC9yZWN0PgogICAgPC9kZWZzPgogICAgPGcgaWQ9ImxldHRlcmJveGQtZGVjYWwtZG90cy1wb3MtcmdiIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8Y2lyY2xlIGlkPSJDaXJjbGUiIGZpbGw9IiMyMDI4MzAiIGN4PSIyNTAiIGN5PSIyNTAiIHI9IjI1MCI+PC9jaXJjbGU+CiAgICAgICAgPGcgaWQ9ImRvdHMtbmVnIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2MS4wMDAwMDAsIDE4MC4wMDAwMDApIj4KICAgICAgICAgICAgPGcgaWQ9IkRvdHMiPgogICAgICAgICAgICAgICAgPGVsbGlwc2UgaWQ9IkdyZWVuIiBmaWxsPSIjMDBFMDU0IiBjeD0iMTg5IiBjeT0iNjkuOTczMjgyNCIgcng9IjcwLjA3ODY1MTciIHJ5PSI2OS45NzMyODI0Ij48L2VsbGlwc2U+CiAgICAgICAgICAgICAgICA8ZyBpZD0iQmx1ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjQ4LjE1MjY3MiwgMC4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICA8bWFzayBpZD0ibWFzay0yIiBmaWxsPSJ3aGl0ZSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDx1c2UgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+CiAgICAgICAgICAgICAgICAgICAgPC9tYXNrPgogICAgICAgICAgICAgICAgICAgIDxnIGlkPSJNYXNrIj48L2c+CiAgICAgICAgICAgICAgICAgICAgPGVsbGlwc2UgZmlsbD0iIzQwQkNGNCIgbWFzaz0idXJsKCNtYXNrLTIpIiBjeD0iNTkuNzY4Njc2NiIgY3k9IjY5Ljk3MzI4MjQiIHJ4PSI3MC4wNzg2NTE3IiByeT0iNjkuOTczMjgyNCI+PC9lbGxpcHNlPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPGcgaWQ9Ik9yYW5nZSI+CiAgICAgICAgICAgICAgICAgICAgPG1hc2sgaWQ9Im1hc2stNCIgZmlsbD0id2hpdGUiPgogICAgICAgICAgICAgICAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiNwYXRoLTMiPjwvdXNlPgogICAgICAgICAgICAgICAgICAgIDwvbWFzaz4KICAgICAgICAgICAgICAgICAgICA8ZyBpZD0iTWFzayI+PC9nPgogICAgICAgICAgICAgICAgICAgIDxlbGxpcHNlIGZpbGw9IiNGRjgwMDAiIG1hc2s9InVybCgjbWFzay00KSIgY3g9IjcwLjA3ODY1MTciIGN5PSI2OS45NzMyODI0IiByeD0iNzAuMDc4NjUxNyIgcnk9IjY5Ljk3MzI4MjQiPjwvZWxsaXBzZT4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMjkuNTM5MzI2LDEwNy4wMjIyNDQgQzEyMi44MTA0OTMsOTYuMjc4MTY3NyAxMTguOTIxMzQ4LDgzLjU3OTIyMTMgMTE4LjkyMTM0OCw2OS45NzMyODI0IEMxMTguOTIxMzQ4LDU2LjM2NzM0MzUgMTIyLjgxMDQ5Myw0My42NjgzOTcyIDEyOS41MzkzMjYsMzIuOTI0MzIwOSBDMTM2LjI2ODE1OSw0My42NjgzOTcyIDE0MC4xNTczMDMsNTYuMzY3MzQzNSAxNDAuMTU3MzAzLDY5Ljk3MzI4MjQgQzE0MC4xNTczMDMsODMuNTc5MjIxMyAxMzYuMjY4MTU5LDk2LjI3ODE2NzcgMTI5LjUzOTMyNiwxMDcuMDIyMjQ0IFoiIGlkPSJPdmVybGFwIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMjQ4LjQ2MDY3NCwzMi45MjQzMjA5IEMyNTUuMTg5NTA3LDQzLjY2ODM5NzIgMjU5LjA3ODY1Miw1Ni4zNjczNDM1IDI1OS4wNzg2NTIsNjkuOTczMjgyNCBDMjU5LjA3ODY1Miw4My41NzkyMjEzIDI1NS4xODk1MDcsOTYuMjc4MTY3NyAyNDguNDYwNjc0LDEwNy4wMjIyNDQgQzI0MS43MzE4NDEsOTYuMjc4MTY3NyAyMzcuODQyNjk3LDgzLjU3OTIyMTMgMjM3Ljg0MjY5Nyw2OS45NzMyODI0IEMyMzcuODQyNjk3LDU2LjM2NzM0MzUgMjQxLjczMTg0MSw0My42NjgzOTcyIDI0OC40NjA2NzQsMzIuOTI0MzIwOSBaIiBpZD0iT3ZlcmxhcCIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';
const LINE = f => `${f.title} (${f.year})`;
const kind = f => Number.isInteger(f.runtime) && f.runtime >= 0 ? (f.runtime <= 40 ? 'short' : 'movie') : 'unknown';
function select(films, group = 'all') {
  return [...new Map(films.map(f => [f.path, f])).values()]
    .filter(f => group === 'all' || kind(f) === group)
    .sort((a,b) => a.title.localeCompare(b.title, 'en', { sensitivity:'base', numeric:true }) || a.year-b.year);
}
function text(films, group) { return select(films, group).map(LINE).join('\n'); }
function parseList(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const films = [...doc.querySelectorAll('[data-component-class="LazyPoster"][data-item-link]')].map(el => {
    const path = el.getAttribute('data-item-link');
    const match = /^(.*) \((\d{4})\)$/.exec(el.getAttribute('data-item-name') || '');
    if (!match || !/^\/film\/[a-z0-9-]+\/$/.test(path)) throw new Error('Letterboxd returned an unfamiliar film format. Your saved list was kept.');
    const ratingClass = el.closest('li')?.querySelector('.rating')?.className || '';
    const rated = /\brated-(\d+)\b/.exec(ratingClass);
    const rating = rated && Number(rated[1]) >= 1 && Number(rated[1]) <= 10 ? Number(rated[1])/2 : null;
    return { title:match[1], year:Number(match[2]), path, runtime:null, rating };
  });
  const next = doc.querySelector('.paginate-nextprev a.next')?.getAttribute('href');
  const countText = doc.querySelector('.section-heading .tooltip[title]')?.getAttribute('title') || '';
  const countMatch = /([\d,\s\u00a0]+)\s+films?/.exec(countText);
  return { films, next, count: countMatch ? Number(countMatch[1].replace(/\D/g,'')) : null };
}
function parseRuntime(html) {
  const duration = /"duration"\s*:\s*"PT(?:(\d+)H)?(?:(\d+)M)?"/.exec(html);
  if (duration && (duration[1] || duration[2])) return Number(duration[1] || 0)*60 + Number(duration[2] || 0);
  const mins = /(\d+)(?:&nbsp;|\s)*mins/.exec(html);
  return mins ? Number(mins[1]) : null;
}
function parseCsv(csv) {
  const rows = csvRows(csv.replace(/^\uFEFF/, ''));
  const headers = rows.shift() || [];
  const title=headers.indexOf('Name'),year=headers.indexOf('Year'),uri=headers.indexOf('Letterboxd URI');
  if(title<0 || year<0 || uri<0 || headers.includes('Rating'))throw new Error('Choose watched.csv or the original Letterboxd export ZIP.');
  return rows.map(r=>{
    if(!r[title] || !/^\d{4}$/.test(r[year]) || !/^https:\/\/(?:boxd\.it\/[A-Za-z0-9]+|letterboxd\.com\/film\/[a-z0-9-]+\/?)$/.test(r[uri]))throw new Error('Invalid watched.csv row. Your saved list was kept.');
    return {title:r[title],year:Number(r[year]),path:r[uri],runtime:null,loggedDate:releaseDate(r[headers.indexOf('Date')]),loggedOrder:null};
  });
}
function zipEntry(bytes, filename = 'watched.csv') {
  const { Buffer }=require('buffer');const data=Buffer.from(bytes);
  let end=-1;
  for(let i=data.length-22;i>=Math.max(0,data.length-65557);i--)if(data.readUInt32LE(i)===0x06054b50){end=i;break;}
  if(end<0)throw new Error('Invalid export ZIP.');
  let offset=data.readUInt32LE(end+16);
  const count=data.readUInt16LE(end+10);
  for(let n=0;n<count;n++) {
    if(data.readUInt32LE(offset)!==0x02014b50)throw new Error('Invalid ZIP directory.');
    const method=data.readUInt16LE(offset+10),size=data.readUInt32LE(offset+20),uncompressed=data.readUInt32LE(offset+24);
    const nameLength=data.readUInt16LE(offset+28),extra=data.readUInt16LE(offset+30),comment=data.readUInt16LE(offset+32);
    const name=data.subarray(offset+46,offset+46+nameLength).toString('utf8');
    if(name===filename) {
      if(uncompressed>10*1024*1024)throw new Error('watched.csv is too large.');
      const local=data.readUInt32LE(offset+42);
      if(data.readUInt32LE(local)!==0x04034b50)throw new Error('Invalid ZIP file.');
      const start=local+30+data.readUInt16LE(local+26)+data.readUInt16LE(local+28);
      const compressed=data.subarray(start,start+size);
      if(method===0)return compressed.toString('utf8');
      if(method!==8)throw new Error('Unsupported ZIP compression. Extract watched.csv and import it.');
      return require('zlib').inflateRawSync(compressed,{maxOutputLength:10*1024*1024}).toString('utf8');
    }
    offset+=46+nameLength+extra+comment;
  }
  return null;
}
function watchedFromZip(bytes) {
  const csv = zipEntry(bytes);
  if (csv === null) throw new Error('This ZIP does not contain watched.csv.');
  return csv;
}
function csvRows(csv) {
  // Reuse the quoted-field parser for auxiliary export tables.
  const rows=[]; let row=[], field='', quoted=false;
  for(let i=0;i<csv.length;i++) {
    const c=csv[i];
    if(c==='"') { if(quoted && csv[i+1]==='"') {field+='"';i++;} else quoted=!quoted; }
    else if(c===',' && !quoted) {row.push(field);field='';}
    else if((c==='\n' || c==='\r') && !quoted) {if(c==='\r' && csv[i+1]==='\n')i++;row.push(field);if(row.some(Boolean))rows.push(row);row=[];field='';}
    else field+=c;
  }
  row.push(field);if(row.some(Boolean))rows.push(row);
  if(quoted)throw new Error('Invalid CSV.');
  return rows;
}
function validUsername(value) {
  const username = String(value || '').trim().replace(/^@/, '').toLowerCase();
  if(username && !/^[a-z0-9_]{1,40}$/.test(username)) throw new Error('Enter a Letterboxd username.');
  return username;
}
function validNotePath(value) {
  const path=String(value || '').trim().replace(/\\/g,'/');
  if(!path.endsWith('.md') || /[:\x00-\x1f]/.test(path) || path.startsWith('/') || path.split('/').some(part=>!part || part==='..' || part.startsWith('.')))throw new Error('Enter a vault-relative Markdown path.');
  return path;
}
function filmUrl(film) {
  const value=film.path || '';
  if(/^\/film\/[a-z0-9-]+\/$/.test(value)) return `https://letterboxd.com${value}`;
  if(/^https:\/\/(?:boxd\.it\/[A-Za-z0-9]+|letterboxd\.com\/film\/[a-z0-9-]+\/?)$/.test(value)) return value;
  return null;
}
function smallPoster(url) {
  if(typeof url !== 'string')return null;
  try {
    const parsed=new URL(url);
    if(parsed.protocol!=='https:' || parsed.username || parsed.password || parsed.port || !['a.ltrbxd.com','s.ltrbxd.com'].includes(parsed.hostname))return null;
    return url.replace(/-0-\d+-0-\d+-crop\./,'-0-70-0-105-crop.');
  } catch {return null;}
}
function releaseDate(value) {
  if(typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const date=new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10)===value ? value : null;
}
function releaseKey(film) { return releaseDate(film.releaseDate) || `${film.year}-00-00`; }
function releaseLabel(film) {
  const date=releaseDate(film?.releaseDate);
  return date ? new Intl.DateTimeFormat(undefined,{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T00:00:00Z`)) : String(film?.year ?? '—');
}
function loggedLabel(film) {
  const value=film.loggedDate;
  if(!value)return 'Logged date unavailable';
  const day=releaseDate(value);
  const date=new Date(day ? `${day}T00:00:00Z` : value);
  if(!Number.isFinite(date.getTime()))return 'Logged date unavailable';
  const options={day:'numeric',month:'short',year:'numeric'};
  if(day)options.timeZone='UTC';
  return `Logged ${new Intl.DateTimeFormat(undefined,options).format(date)}`;
}
function libraryCsv(films) {
  const cell=value=>{
    let output=String(value ?? '');
    if(/^[=+@\-\t\r\n]/.test(output))output=`'${output}`;
    return `"${output.replace(/"/g,'""')}"`;
  };
  const rows=[['Title','Year','Release date','Type','Runtime (minutes)','Logged date','Your rating','Letterboxd average','Letterboxd URL']];
  for(const f of select(films))rows.push([f.title,f.year,releaseDate(f.releaseDate),kind(f),f.runtime,f.loggedDate,f.rating,f.average,filmUrl(f)]);
  return rows.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
function parseMetadata(html) {
  let movie;
  for(const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let json;try {json=JSON.parse(match[1].replace(/\/\*[^]*?\*\//g,''));} catch {continue;}
    const nodes=Array.isArray(json) ? json : (json['@graph'] || [json]);
    movie=nodes.find(n=>n['@type']==='Movie' || (Array.isArray(n['@type']) && n['@type'].includes('Movie')));
    if(movie)break;
  }
  if(!movie && parseRuntime(html) === null) throw new Error('Film details unavailable.');
  const rating=Number(movie?.aggregateRating?.ratingValue);
  return {
    runtime:parseRuntime(html),
    releaseDate:releaseDate(movie?.dateCreated) || releaseDate(movie?.datePublished),
    poster:smallPoster(typeof movie?.image==='object' ? movie.image.url : movie?.image),
    average: Number.isFinite(rating) && rating>=0.5 && rating<=5 ? rating : null,
    metadataAt:new Date().toISOString()
  };
}
function stats(films) {
  const unique=select(films), rated=unique.filter(f=>Number.isFinite(f.rating) && f.rating>=0.5 && f.rating<=5);
  const runtimeFilms=unique.filter(f=>Number.isInteger(f.runtime) && f.runtime>=0).sort((a,b)=>a.runtime-b.runtime);
  const byYear=[...unique].sort((a,b)=>releaseKey(a).localeCompare(releaseKey(b)) || a.title.localeCompare(b.title));
  const ratingValues=rated.map(f=>f.rating).sort((a,b)=>a-b);
  const decades=new Map(), ratings=new Map();
  for(let r=.5;r<=5;r+=.5)ratings.set(r,0);
  for(const f of unique) {const decade=Math.floor(f.year/10)*10;decades.set(decade,(decades.get(decade)||0)+1);}
  for(const f of rated)ratings.set(f.rating,(ratings.get(f.rating)||0)+1);
  return {
    total:unique.length, movies:unique.filter(f=>kind(f)==='movie').length,
    shorts:unique.filter(f=>kind(f)==='short').length, unknown:unique.filter(f=>kind(f)==='unknown').length,
    hours:unique.reduce((sum,f)=>sum+(Number.isInteger(f.runtime) && f.runtime>=0 ? f.runtime : 0),0)/60,
    average:rated.length ? rated.reduce((sum,f)=>sum+f.rating,0)/rated.length : null,
    averageRuntime:runtimeFilms.length ? runtimeFilms.reduce((sum,f)=>sum+f.runtime,0)/runtimeFilms.length : null,
    runtimeCount:runtimeFilms.length, longest:runtimeFilms.at(-1) || null, shortest:runtimeFilms[0] || null,
    oldest:byYear[0] || null,newest:byYear.at(-1) || null,
    partialReleaseDates:unique.filter(f=>!releaseDate(f.releaseDate)).length,
    fiveStars:rated.filter(f=>f.rating===5).length,fourPlus:rated.filter(f=>f.rating>=4).length,
    median:ratingValues.length ? (ratingValues[Math.floor((ratingValues.length-1)/2)]+ratingValues[Math.floor(ratingValues.length/2)])/2 : null,
    rated:rated.length, decades:[...decades].sort((a,b)=>a[0]-b[0]), ratings:[...ratings]
  };
}
function filterFilms(films, options = {}) {
  const { category='all', query='', ratingFilter='all', decade='all', sort='title', direction='asc' } = options;
  const result=select(films,category).filter(f=>{
    if(!LINE(f).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))return false;
    const rated=Number.isFinite(f.rating) && f.rating>=.5 && f.rating<=5;
    if(ratingFilter==='rated' && !rated || ratingFilter==='unrated' && rated)return false;
    if(ratingFilter==='fourPlus' && (!rated || f.rating<4))return false;
    if(ratingFilter.startsWith('rating:') && (!rated || f.rating!==Number(ratingFilter.slice(7))))return false;
    return decade==='all' || Math.floor(f.year/10)*10===Number(decade);
  });
  const sign=direction==='desc' ? -1 : 1;
  result.sort((a,b)=>{
    if(sort==='logged') {
      if(Number.isInteger(a.loggedOrder) && Number.isInteger(b.loggedOrder))return -sign*(a.loggedOrder-b.loggedOrder);
      const aDate=Date.parse(a.loggedDate || ''),bDate=Date.parse(b.loggedDate || '');
      if(!Number.isFinite(aDate))return Number.isFinite(bDate) ? 1 : a.title.localeCompare(b.title);
      if(!Number.isFinite(bDate))return -1;
      return sign*(aDate-bDate) || a.title.localeCompare(b.title);
    }
    if(sort==='title')return sign*(a.title.localeCompare(b.title,'en',{sensitivity:'base',numeric:true}) || a.year-b.year);
    if(sort==='year')return sign*releaseKey(a).localeCompare(releaseKey(b)) || a.title.localeCompare(b.title);
    const aValue=a[sort],bValue=b[sort];
    if(aValue==null || !Number.isFinite(aValue))return bValue==null || !Number.isFinite(bValue) ? a.title.localeCompare(b.title) : 1;
    if(bValue==null || !Number.isFinite(bValue))return -1;
    return sign*(aValue-bValue) || a.title.localeCompare(b.title,'en',{sensitivity:'base',numeric:true});
  });
  return result;
}
function parseRecentLogs(xml) {
  const document=new DOMParser().parseFromString(xml,'text/xml');
  const entries=[];
  for(const item of document.getElementsByTagName('item')) {
    const link=item.getElementsByTagName('link')[0]?.textContent || '';
    const match=/^https:\/\/letterboxd\.com\/[a-z0-9_]+\/film\/([a-z0-9-]+)\//.exec(link);
    const date=new Date(item.getElementsByTagName('pubDate')[0]?.textContent || '');
    if(match && Number.isFinite(date.getTime()))entries.push({path:`/film/${match[1]}/`,loggedDate:date.toISOString()});
  }
  return entries;
}
function exportData(bytes) {
  const films=parseCsv(watchedFromZip(bytes));
  const ratingCsv=zipEntry(bytes,'ratings.csv');
  if(ratingCsv) {
    const [headers,...rows]=csvRows(ratingCsv);const name=headers.indexOf('Name'),year=headers.indexOf('Year'),rating=headers.indexOf('Rating');
    const ratings=new Map(rows.map(row=>[`${row[name]}\u0000${row[year]}`,Number(row[rating])]));
    for(const film of films) {const value=ratings.get(`${film.title}\u0000${film.year}`);film.rating=Number.isFinite(value) && value>=.5 && value<=5 && value*2%1===0 ? value : null;}
  }
  const diaryCsv=zipEntry(bytes,'diary.csv');
  if(diaryCsv) {
    const [headers,...entries]=csvRows(diaryCsv);
    const dates=new Map();
    for(const row of entries) {
      const date=releaseDate(row[headers.indexOf('Date')]);
      const key=`${row[headers.indexOf('Name')]}\u0000${row[headers.indexOf('Year')]}`;
      if(date && (!dates.has(key) || date>dates.get(key)))dates.set(key,date);
    }
    for(const film of films) {const date=dates.get(`${film.title}\u0000${film.year}`);if(date && (!film.loggedDate || date>film.loggedDate))film.loggedDate=date;}
  }
  let username='';const profile=zipEntry(bytes,'profile.csv');
  if(profile){const [headers,row]=csvRows(profile);username=validUsername(row?.[headers.indexOf('Username')]);}
  return {films,username};
}
class LibraryBlock extends MarkdownRenderChild {
  constructor(el, plugin) {
    super(el);
    this.plugin = plugin;
    this.filter = 'all';
    this.query = '';
    this.tab = 'library';
    this.sort = 'logged';
    this.direction = 'desc';
    this.ratingFilter = 'all';
    this.decade = 'all';
  }
  onload() { this.plugin.blocks.add(this); this.render(); }
  onunload() { this.plugin.blocks.delete(this); }
  iconButton(parent, icon, label, callback) {
    const button = parent.createEl('button', { cls: 'clickable-icon', attr: { 'aria-label': label, title: label } });
    setIcon(button, icon);
    button.addEventListener('click', callback);
    return button;
  }
  render() {
    const p = this.plugin, root = this.containerEl;
    root.empty(); root.addClass('letterboxd-library');
    const films = p.activeFilms(), summary = stats(films);
    const header = root.createDiv({ cls: 'lb-header' });
    const profile = header.createEl('a', { cls: 'lb-profile', href: p.settings.username ? `https://letterboxd.com/${p.settings.username}/` : 'https://letterboxd.com/', attr: { target: '_blank', rel: 'noopener noreferrer' } });
    profile.createEl('img', { cls: 'lb-logo', attr: { src: LOGO, alt: 'Letterboxd', width: '24', height: '24' } });
    profile.createSpan({ text: p.settings.username ? `@${p.settings.username}` : 'Letterboxd' });
    const actions = header.createDiv({ cls: 'lb-header-actions' });
    this.iconButton(actions, 'refresh-cw', 'Refresh library', () => p.refresh()).disabled = p.syncing || !p.settings.username;
    this.iconButton(actions, 'settings', 'Letterboxd Library settings', () => p.openSettings());
    if (p.error || p.progress) root.createDiv({ text: p.error || p.progress, cls: `lb-status${p.error ? ' lb-error' : ''}`, attr: { role: 'status', 'aria-live': 'polite' } });
    if (!films.length) {
      const empty = root.createDiv({ cls: 'lb-empty' });
      empty.createEl('p', { text: p.settings.username ? 'Import an export or refresh to load watched films.' : 'Set your Letterboxd username or import an export.' });
      const settingsButton = empty.createEl('button', { text: 'Open settings' });
      settingsButton.addEventListener('click', () => p.openSettings());
      return;
    }
    const nav = root.createDiv({ cls: 'lb-nav', attr: { 'aria-label': 'Library views' } });
    for (const [tab,label] of [['library','Library'],['stats','Stats']]) {
      const button = nav.createEl('button', { text: label, attr: { 'aria-pressed': String(this.tab === tab) } });
      button.addEventListener('click', () => { this.tab = tab; this.render(); });
    }
    if (this.tab === 'stats') this.renderStats(root, summary);
    else this.renderLibrary(root, films);
    if (p.data.lastSync) root.createDiv({ text: `Updated ${new Date(p.data.lastSync).toLocaleDateString()}`, cls: 'lb-updated' });
  }
  renderStats(root, summary) {
    const panel = root.createDiv({ cls: 'lb-stats-grid' });
    const chart = (title, subtitle, entries, format, color, onClick) => {
      const section = panel.createEl('section', { cls: `lb-chart-panel ${color}`, attr: { 'aria-label': title } });
      section.createDiv({ text: title, cls: 'lb-section-title' });
      section.createDiv({ text: subtitle, cls: 'lb-chart-subtitle' });
      const histogram = section.createDiv({ cls: 'lb-histogram' });
      const max = Math.max(1, ...entries.map(([,count]) => count));
      for(const [key,count] of entries) {
        const column = histogram.createEl('button', { cls: 'lb-hist-column', attr: { title: `${format(key)}: ${count} films`, 'aria-label': `${format(key)}: ${count} films. Show in library.` } });
        column.createSpan({ text: String(count), cls: 'lb-hist-count' });
        const track = column.createDiv({ cls: 'lb-hist-track' });
        track.createDiv({ cls: 'lb-hist-bar' }).style.height = `${count/max*100}%`;
        column.createSpan({ text: String(key), cls: 'lb-hist-label' });
        column.addEventListener('click', () => { onClick(key); this.tab = 'library'; this.render(); });
      }
    };
    chart('Ratings', `${summary.average === null ? '—' : summary.average.toFixed(2)} average · ${summary.rated} rated`, summary.ratings, key => `${key} stars`, 'lb-chart-green', key => { this.ratingFilter = `rating:${key}`; this.filter='all'; this.decade='all'; this.query=''; });
    chart('Release decades', `${summary.oldest?.year ?? '—'}–${summary.newest?.year ?? '—'}`, summary.decades, key => `${key}s`, 'lb-chart-blue', key => { this.decade=String(key); this.filter='all'; this.ratingFilter='all'; this.query=''; });
    const details = panel.createEl('section', { cls: 'lb-facts-panel' });
    details.createDiv({ text: 'Runtime', cls: 'lb-section-title' });
    const facts = details.createDiv({ cls: 'lb-facts' });
    for(const [value,label] of [[`${Math.round(summary.hours).toLocaleString()} h`,'Total'],[`${summary.averageRuntime === null ? '—' : Math.round(summary.averageRuntime)} min`,'Average']]) {
      const item=facts.createDiv();item.createSpan({text:String(value),cls:'lb-fact-value'});item.createSpan({text:label,cls:'lb-stat-label'});
    }
    const highlight = (parent, label, film, value) => {
      if(!film)return;
      const item=parent.createDiv({cls:'lb-highlight'});
      const caption=item.createDiv();caption.createSpan({text:label,cls:'lb-highlight-label'});
      const url=filmUrl(film);
      if(url)caption.createEl('a',{text:film.title,href:url,attr:{target:'_blank',rel:'noopener noreferrer'}});
      else caption.createSpan({text:film.title});
      item.createSpan({text:value,cls:'lb-highlight-value'});
    };
    highlight(details,'Longest',summary.longest,`${summary.longest?.runtime} min`);
    highlight(details,'Shortest',summary.shortest,`${summary.shortest?.runtime} min`);
    const collection=panel.createEl('section',{cls:'lb-facts-panel'});
    collection.createDiv({text:`Collection · ${summary.total} films`,cls:'lb-section-title'});
    const split=collection.createDiv({cls:'lb-format-bar',attr:{'aria-label':`${summary.movies} movies, ${summary.shorts} shorts, ${summary.unknown} unclassified`}});
    for(const [key,count] of [['movie',summary.movies],['short',summary.shorts],['unknown',summary.unknown]]) if(count)split.createSpan({cls:`lb-format-${key}`}).style.width=`${count/summary.total*100}%`;
    const legend=collection.createDiv({cls:'lb-format-legend'});
    for(const [key,label,count] of [['movie','Movies',summary.movies],['short','Shorts',summary.shorts],...(summary.unknown ? [['unknown','Unclassified',summary.unknown]] : [])]) {
      const row=legend.createDiv();row.createSpan({cls:`lb-dot lb-format-${key}`});row.createSpan({text:label});row.createSpan({text:`${count} · ${Math.round(count/summary.total*100)}%`,cls:'lb-legend-count'});
    }
    highlight(collection,'Oldest',summary.oldest,releaseLabel(summary.oldest));
    highlight(collection,'Newest',summary.newest,releaseLabel(summary.newest));
    if(summary.partialReleaseDates)collection.createDiv({text:`${summary.partialReleaseDates} films have year-only release dates.`,cls:'lb-updated'});
    const ratingFacts=panel.createEl('section',{cls:'lb-rating-facts'});
    for(const [value,label] of [[summary.fourPlus,'Rated 4+'],[summary.total-summary.rated,'Unrated'],[summary.median === null ? '—' : `${summary.median} ★`,'Median rating']]) {
      const item=ratingFacts.createDiv();item.createSpan({text:String(value),cls:'lb-fact-value'});item.createSpan({text:label,cls:'lb-stat-label'});
    }
  }
  renderLibrary(root, films) {
    const p = this.plugin;
    const tools = root.createDiv({ cls: 'lb-tools' });
    const search = tools.createEl('input', { type: 'search', placeholder: 'Search films', attr: { 'aria-label': 'Search films' } });
    search.value = this.query;
    const filters = root.createDiv({cls:'lb-filters'});
    const filter = filters.createEl('select', { attr: { 'aria-label': 'Film type' } });
    for (const [value,label] of [['all','All films'],['movie','Movies'],['short','Shorts'],...(films.some(f=>kind(f)==='unknown') ? [['unknown','Unclassified']] : [])]) filter.createEl('option', { value, text: label });
    filter.value = this.filter;
    const sort = tools.createEl('select', { attr: { 'aria-label': 'Sort films' } });
    for (const [value,label] of [['logged','Date logged'],['title','Title'],['year','Release date'],['runtime','Runtime'],['rating','Your rating'],['average','Letterboxd rating']]) sort.createEl('option', { value, text: label });
    sort.value = this.sort;
    const direction = tools.createEl('select', {attr:{'aria-label':'Sort direction'}});
    direction.createEl('option',{value:'asc',text:'Ascending'});
    direction.createEl('option',{value:'desc',text:'Descending'});
    direction.value=this.direction;
    const copy = tools.createEl('button', { text: p.copying ? 'Copying…' : 'Copy', attr: { title: 'Copy titles and years', 'aria-label': 'Copy titles and years' } });
    copy.disabled = Boolean(p.copying || (p.syncing && !p.refreshPromise));
    copy.addEventListener('click', event => {
      const menu = new Menu();
      for (const [group,label] of [['all','Both'],['movie','Movies'],['short','Shorts']]) menu.addItem(item => item.setTitle(label).onClick(() => p.copyFilms(group)));
      menu.showAtMouseEvent(event);
    });
    const rated = filters.createEl('select',{attr:{'aria-label':'Rating filter'}});
    for(const [value,label] of [['all','All ratings'],['rated','Rated'],['unrated','Unrated'],['fourPlus','4 stars or more'],...Array.from({length:10},(_,i)=>[`rating:${(i+1)/2}`,`${(i+1)/2} stars`])])rated.createEl('option',{value,text:label});
    rated.value=this.ratingFilter;
    const decade=filters.createEl('select',{attr:{'aria-label':'Release decade'}});
    decade.createEl('option',{value:'all',text:'All decades'});
    for(const [year] of stats(films).decades)decade.createEl('option',{value:String(year),text:`${year}s`});
    decade.value=this.decade;
    const clear=filters.createEl('button',{text:'Reset',cls:'lb-reset'});
    clear.addEventListener('click',()=>{this.filter='all';this.ratingFilter='all';this.decade='all';this.query='';this.sort='logged';this.direction='desc';this.render();});
    const resultCount=filters.createSpan({cls:'lb-result-count',attr:{role:'status','aria-live':'polite'}});
    const heading = root.createDiv({ cls: 'lb-columns' });
    heading.createSpan({ text: 'Film' });
    heading.createSpan({ text: 'You', attr: { title: 'Your rating out of 5' } });
    const average = heading.createSpan({ cls: 'lb-average-heading', attr: { title: 'Letterboxd average out of 5' } });
    average.createEl('img', { attr: { src: LOGO, alt: '', width: '16', height: '16' } });
    average.createSpan({ text: 'Avg' });
    const list = root.createDiv({ cls: 'lb-list' });
    const draw = () => {
      list.empty();
      const filtered = filterFilms(films,{category:this.filter,query:this.query,ratingFilter:this.ratingFilter,decade:this.decade,sort:this.sort,direction:this.direction});
      resultCount.textContent=`${filtered.length} ${filtered.length===1?'film':'films'}`;
      if (!filtered.length) list.createDiv({ text: 'No films found.', cls: 'lb-empty' });
      for (const film of filtered) {
        const row = list.createDiv({ cls: 'lb-film' });
        const info = row.createDiv({ cls: 'lb-film-info' });
        if(p.settings.showPosters) {
          const poster = info.createDiv({ cls: 'lb-poster' });
          const src = smallPoster(film.poster);
          if(src) {
            const image = poster.createEl('img', { attr: { src, alt: '', width: '32', height: '48', loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' } });
            image.addEventListener('error', () => image.remove(), { once: true });
          }
        }
        const caption = info.createDiv({ cls: 'lb-film-caption' });
        const url = filmUrl(film);
        if(url) caption.createEl('a', { text: film.title, href: url, cls: 'lb-film-title', attr: { target: '_blank', rel: 'noopener noreferrer' } });
        else caption.createSpan({ text: film.title });
        caption.createDiv({ text: `${film.year}${Number.isInteger(film.runtime) ? ` · ${film.runtime} min` : ''}`, cls: 'lb-film-meta' });
        caption.createDiv({text:loggedLabel(film),cls:'lb-film-logged',attr:{title:film.loggedDate || 'Import a Letterboxd export to fill older logged dates.'}});
        row.createSpan({ text: film.rating == null ? '—' : `${film.rating} ★`, cls: 'lb-rating', attr: { 'aria-label': film.rating == null ? 'Not rated by you' : `Your rating: ${film.rating} out of 5` } });
        row.createSpan({ text: film.average == null ? '—' : film.average.toFixed(2), cls: 'lb-rating lb-community', attr: { 'aria-label': film.average == null ? 'Letterboxd average unavailable' : `Letterboxd average: ${film.average.toFixed(2)} out of 5` } });
      }
    };
    search.addEventListener('input', () => { this.query = search.value; draw(); });
    filter.addEventListener('change', () => { this.filter = filter.value; draw(); });
    sort.addEventListener('change', () => { this.sort = sort.value; draw(); });
    direction.addEventListener('change',()=>{this.direction=direction.value;draw();});
    rated.addEventListener('change',()=>{this.ratingFilter=rated.value;draw();});
    decade.addEventListener('change',()=>{this.decade=decade.value;draw();});
    draw();
  }
}
class LibrarySettings extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    renderSettings(this.containerEl, this.plugin);
  }
}
function renderSettings(el, p) {
    el.empty();
    let draft = p.settings.username;
    const account = new Setting(el).setName('Letterboxd username').setDesc('Public profile used for refresh.');
    account.addText(input => input.setPlaceholder('Username').setValue(draft).onChange(value => { draft = value; }));
    account.addButton(button => button.setButtonText('Save').onClick(async () => {
      if(p.syncing) { new Notice('Wait for the current import or refresh.'); return; }
      try { const username = validUsername(draft); await p.saveSettings({ username }); new Notice('Username saved'); }
      catch(error) { new Notice(error.message); }
    }));
    new Setting(el).setName('Note location').setDesc('Vault-relative Markdown path.').addText(input => input.setValue(p.settings.notePath).onChange(async value => {
      try {const notePath=validNotePath(value);await p.saveSettings({notePath});} catch { /* Keep the last valid path while the user is typing. */ }
    }));
    new Setting(el).setName('Refresh before copying').setDesc('Try refreshing first. Use the saved list if Letterboxd is unavailable.').addToggle(toggle => toggle.setValue(p.settings.refreshBeforeCopy).onChange(value => p.saveSettings({ refreshBeforeCopy: value })));
    new Setting(el).setName('Show posters').addToggle(toggle => toggle.setValue(p.settings.showPosters).onChange(value => p.saveSettings({ showPosters: value })));
    new Setting(el).setName('Import export').setDesc('Letterboxd export ZIP or watched.csv.').addButton(button => button.setButtonText('Choose file').setDisabled(p.syncing).onClick(() => p.chooseImport()));
    new Setting(el).setName('Export library').setDesc('Save the complete saved list as a CSV file in your vault.').addButton(button => button.setButtonText('Export CSV').setDisabled(!p.activeFilms().length).onClick(() => p.exportLibrary()));
    new Setting(el).setName('Library').addButton(button => button.setButtonText('Open note').onClick(() => p.openNote()));
}
module.exports = class LetterboxdLibrary extends Plugin {
  async onload() {
    this.unloaded=false; this.blocks = new Set(); this.syncing = false; this.error = ''; this.progress = '';
    const saved = await this.loadData() || {};
    this.settings = { ...DEFAULT_SETTINGS, ...saved.settings };
    this.data = { films: [], lastSync: null, username: '', ...saved };
    this.addSettingTab(new LibrarySettings(this.app, this));
    this.registerMarkdownCodeBlockProcessor('letterboxd-library', (_source,el,ctx) => ctx.addChild(new LibraryBlock(el,this)));
    this.addCommand({ id: 'open-library', name: 'Open library', callback: () => this.openNote() });
    this.addCommand({ id: 'refresh-library', name: 'Refresh library', callback: () => this.refresh() });
    this.addCommand({ id: 'export-library', name: 'Export library as CSV', callback: () => this.exportLibrary() });
    this.addCommand({ id: 'import-library', name: 'Import export', callback: () => this.chooseImport() });
    this.addRibbonIcon('clapperboard', 'Open Letterboxd library', () => this.openNote());
  }
  onunload() { this.unloaded=true; }
  activeFilms() { return this.data.username === this.settings.username ? this.data.films : []; }
  redraw() { for(const block of this.blocks) block.render(); }
  enqueueSave(task) {
    const pending=(this.saveQueue || Promise.resolve()).catch(()=>{}).then(task);
    this.saveQueue=pending;
    return pending;
  }
  saveSettings(patch) {
    return this.enqueueSave(async()=>{
      const settings={...this.settings,...patch};
      await this.saveData({...this.data,settings});
      this.settings=settings;this.redraw();
    });
  }
  commitLibrary(next) {
    return this.enqueueSave(async()=>{
      if(this.unloaded)return false;
      const settings={...this.settings,username:next.username};
      const data={...next,settings};
      await this.saveData(data);this.data=data;this.settings=settings;
      return true;
    });
  }
  openSettings() {
    const modal=new Modal(this.app);
    modal.titleEl.setText('Letterboxd Library');
    renderSettings(modal.contentEl,this);
    modal.open();
  }
  async exportLibrary() {
    if(this.exporting)return null;
    const films=this.activeFilms();
    if(!films.length) { new Notice('No films to export.'); return null; }
    this.exporting=true;
    try {
      const now=new Date();
      const day=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const base=`Letterboxd ${this.settings.username || 'library'} ${day}`;
      let path=`${base}.csv`, suffix=2;
      while(this.app.vault.getAbstractFileByPath(path))path=`${base} (${suffix++}).csv`;
      await this.app.vault.create(path,libraryCsv(films));
      new Notice(`Exported ${select(films).length} films to ${path}`);
      return path;
    } catch(error) { new Notice('Could not export the library.'); return null; }
    finally {this.exporting=false;}
  }
  chooseImport() {
    if(this.syncing)return;
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.zip,.csv';
    input.addEventListener('change', () => { if(input.files?.[0]) this.importFile(input.files[0]); });
    input.click();
  }
  async openNote() {
    const path = validNotePath(this.settings.notePath);
    let file = this.app.vault.getAbstractFileByPath(path);
    if(!file) {
      const parts = path.split('/'); parts.pop(); let folder = '';
      for(const part of parts) { folder = folder ? `${folder}/${part}` : part; if(!this.app.vault.getAbstractFileByPath(folder)) await this.app.vault.createFolder(folder); }
      file = await this.app.vault.create(path, '```letterboxd-library\n```\n');
    }
    await this.app.workspace.getLeaf(false).openFile(file, { state: { mode: 'preview' } });
  }
  async fetchPage(path) {
    const username = validUsername(this.settings.username);
    const listPath = new RegExp(`^/${username}/films/(?:by/date/)?(?:page/\\d+/)?$`);
    if(!/^\/film\/[a-z0-9-]+\/$/.test(path) && (!username || !listPath.test(path) && path!==`/${username}/rss/`)) throw new Error('Unexpected Letterboxd URL.');
    const response = await requestUrl({ url: `https://letterboxd.com${path}`, throw: false });
    if(response.status !== 200) throw new Error(`Letterboxd returned HTTP ${response.status}. Import an export or try again later.`);
    return response.text;
  }
  async metadata(film) {
    const url = filmUrl(film);
    if(!url)throw new Error('Invalid film URL.');
    const response = await requestUrl({ url, throw: false });
    if(response.status !== 200)throw new Error(`Letterboxd returned HTTP ${response.status}.`);
    return parseMetadata(response.text);
  }
  async importFile(file) {
    if(this.syncing)return;
    this.syncing = true; this.error = ''; this.progress = 'Importing…'; this.redraw();
    try {
      if(file.size > 20*1024*1024)throw new Error('Export must be smaller than 20 MB.');
      const imported = file.name.toLowerCase().endsWith('.zip') ? exportData(await file.arrayBuffer()) : { films: parseCsv(await file.text()), username: this.settings.username };
      if(!imported.films.length)throw new Error('The watched list is empty.');
      const username = imported.username || this.settings.username;
      if(!username)throw new Error('Set a username in settings or import the full export ZIP.');
      const sameAccount = this.data.username === username;
      const cache = new Map((sameAccount ? this.data.films : []).map(f => [`${f.title}\u0000${f.year}`,f]));
      const films = imported.films.map(f => {
        const previous = cache.get(`${f.title}\u0000${f.year}`);
        return { ...previous, ...f, path: previous?.path || f.path, runtime: previous?.runtime ?? f.runtime };
      });
      let missing = 0;
      for(let i=0;i<films.length;i++) {
        if(this.unloaded)return false;
        const film = films[i];
        if(!film.metadataAt || !film.releaseDate) {
          this.progress = `Loading film details… ${i+1}/${films.length}`;
          if(i%10===0)this.redraw();
          try { Object.assign(film, await this.metadata(film)); } catch { missing++; }
        }
      }
      const settings = { ...this.settings, username };
      const next = { films: select(films), username, settings, lastSync: new Date().toISOString() };
      if(this.unloaded)return false;
      if(!await this.commitLibrary(next))return false;
      new Notice(`Imported ${next.films.length} films${missing ? ` · ${missing} without film details` : ''}`);
    } catch(error) { this.error = error.message || 'Import failed.'; new Notice(this.error); }
    finally { this.syncing = false; this.progress = ''; this.redraw(); }
  }
  async copyFilms(group) {
    if(this.copying)return false;
    if(this.syncing && !this.refreshPromise) { new Notice('Wait for the current import.'); return false; }
    this.copying = true; this.redraw();
    try {
      let refreshed = true;
      const refreshFirst = this.settings.refreshBeforeCopy !== false && Boolean(this.settings.username);
      if(refreshFirst) refreshed = await this.refresh();
      if(this.unloaded)return false;
      const films = this.activeFilms();
      await navigator.clipboard.writeText(text(films, group));
      new Notice(`Copied ${select(films, group).length} titles${refreshFirst && !refreshed ? ' · Saved list used' : ''}`);
      return true;
    } catch(error) { new Notice('Could not copy titles.'); return false; }
    finally { this.copying = false; this.redraw(); }
  }
  refresh() {
    if(this.refreshPromise)return this.refreshPromise;
    if(this.syncing)return Promise.resolve(false);
    const pending = this.refreshLibrary();
    this.refreshPromise = pending;
    const clear = () => { if(this.refreshPromise === pending)this.refreshPromise = null; };
    pending.then(clear, clear);
    return pending;
  }
  async refreshLibrary() {
    if(this.syncing)return;
    if(!this.settings.username) { this.openSettings(); return false; }
    this.syncing = true; this.error = ''; this.progress = 'Refreshing…'; this.redraw();
    try {
      const found = new Map(), seen = new Set(); let path = `/${validUsername(this.settings.username)}/films/by/date/`, expected = null;
      while(path) {
        if(seen.has(path) || seen.size >= 1000)throw new Error('Could not read all watched pages.');
        seen.add(path);
        const parsed = parseList(await this.fetchPage(path));
        if(expected === null)expected = parsed.count;
        if(!parsed.films.length && expected !== 0)throw new Error('Could not read the watched list.');
        for(const film of parsed.films)found.set(film.path,film);
        path = parsed.next;
      }
      if(expected === null || found.size !== expected)throw new Error('The watched list is incomplete. Try importing an export.');
      let recent=[];
      try {recent=parseRecentLogs(await this.fetchPage(`/${validUsername(this.settings.username)}/rss/`));} catch { /* The full watched list remains usable if RSS is unavailable. */ }
      const recentByFilm=new Map();
      for(const entry of recent)if(!recentByFilm.has(entry.path))recentByFilm.set(entry.path,entry);
      const liveOrder=[...found.keys()];
      const ordered=[...recentByFilm.keys()].filter(path=>found.has(path)).concat(liveOrder.filter(path=>!recentByFilm.has(path)));
      const ranks=new Map(ordered.map((path,index)=>[path,index]));
      for(const film of found.values()) {film.loggedOrder=ranks.get(film.path);const entry=recentByFilm.get(film.path);if(entry)film.loggedDate=entry.loggedDate;}
      const cache = new Map(this.activeFilms().map(f => [f.path,f]));
      const films = [...found.values()].map(f => ({ ...cache.get(f.path), ...f, runtime: cache.get(f.path)?.runtime ?? f.runtime }));
      let index = 0, done = 0;
      const worker = async () => {
        while(index < films.length) {
          if(this.unloaded)return;
          const film = films[index++];
          if(!film.metadataAt || !film.releaseDate || Date.now()-new Date(film.metadataAt).getTime()>7*86400000) Object.assign(film,await this.metadata(film));
          done++; if(done%10===0) { this.progress = `Loading film details… ${done}/${films.length}`; this.redraw(); }
        }
      };
      const results = await Promise.allSettled([worker(),worker()]);
      const failed = results.find(r => r.status === 'rejected'); if(failed)throw failed.reason;
      const next = { films, username: this.settings.username, settings: this.settings, lastSync: new Date().toISOString() };
      if(this.unloaded)return false;
      if(!await this.commitLibrary(next))return false;
      new Notice(`Updated ${films.length} films`);
      return true;
    } catch(error) { this.error = error.message || 'Refresh failed.'; new Notice(this.error); return false; }
    finally { this.syncing = false; this.progress = ''; this.redraw(); }
  }
};
module.exports.core = { select, text, kind, parseList, parseRuntime, parseCsv, watchedFromZip, zipEntry, exportData, parseMetadata, smallPoster, stats, filterFilms, validUsername, filmUrl, releaseDate, releaseLabel, libraryCsv, parseRecentLogs, LibraryBlock, validNotePath, loggedLabel };
