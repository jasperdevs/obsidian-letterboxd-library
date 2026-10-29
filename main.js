const { Plugin, PluginSettingTab, Setting, Menu, Modal, ItemView, MarkdownRenderChild, Notice, requestUrl, setIcon } = require('obsidian');
const LIBRARY_VIEW = 'letterboxd-library-view';
const DEFAULT_SETTINGS = { username: '', notePath: 'Letterboxd.md', showPosters: true, refreshBeforeCopy: true };
const LOGO = 'data:image/png;base64,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';
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
function validReviewUrl(value) {
  if(typeof value!=='string')return null;
  return /^https:\/\/(?:boxd\.it\/[A-Za-z0-9]+|letterboxd\.com\/[a-z0-9_]+\/film\/[a-z0-9-]+\/(?:[0-9]+\/)?)$/.test(value) ? value : null;
}
function mergeReviews(existing = [], incoming = []) {
  const result=existing.filter(r=>r && typeof r.text==='string' && r.text.trim()).map(r=>({...r}));
  const normalized=value=>value.trim().replace(/\s+/g,' ');
  for(const review of incoming) {
    if(!review || typeof review.text!=='string' || !review.text.trim())continue;
    const index=result.findIndex(previous=>(previous.id && previous.id===review.id) || (previous.url && previous.url===review.url) ||
      (previous.source!==review.source && normalized(previous.text)===normalized(review.text) &&
        ((previous.watchedDate && previous.watchedDate===review.watchedDate) || (previous.date && review.date && String(previous.date).slice(0,10)===String(review.date).slice(0,10)))));
    if(index<0)result.push({...review});
    else result[index]={...result[index],...review,id:result[index].id};
  }
  return result.sort((a,b)=>(Date.parse(b.date || '') || 0)-(Date.parse(a.date || '') || 0));
}
function reviewHtmlText(html) {
  const doc=new DOMParser().parseFromString(html,'text/html');
  for(const el of doc.querySelectorAll('img,script,style,iframe,object,embed,form'))el.remove();
  for(const el of doc.querySelectorAll('p')) {
    if(/^Watched (?:on|before) (?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) .+\d{4}\.$/.test(el.textContent.trim()))el.remove();
    else el.append('\n\n');
  }
  for(const el of doc.querySelectorAll('br'))el.replaceWith('\n');
  return (doc.body.textContent || '').replace(/\n{3,}/g,'\n\n').trim();
}
function libraryCsv(films, {includeRatings=true,includeReviews=false} = {}) {
  const cell=value=>{
    let output=String(value ?? '');
    if(/^[=+@\-\t\r\n]/.test(output))output=`'${output}`;
    return `"${output.replace(/"/g,'""')}"`;
  };
  const header=['Title','Year','Release date','Type','Runtime (minutes)','Logged date'];
  if(includeRatings)header.push('Your rating','Letterboxd average');
  header.push('Letterboxd URL');
  if(includeReviews)header.push('Review count','Reviews','Review links');
  const rows=[header];
  for(const f of select(films)) {
    const row=[f.title,f.year,releaseDate(f.releaseDate),kind(f),f.runtime,f.loggedDate];
    if(includeRatings)row.push(f.rating,f.average);
    row.push(filmUrl(f));
    if(includeReviews) {
      const reviews=mergeReviews([],f.reviews || []);
      const content=reviews.map((review,index)=>{
        const date=review.watchedDate || String(review.date || '').slice(0,10);
        return [`Review ${index+1}${date ? ` · ${date}` : ''}${includeRatings && review.rating!=null ? ` · ${review.rating}/5` : ''}`,review.text].join('\n');
      }).join('\n\n');
      row.push(reviews.length,content,reviews.map(r=>validReviewUrl(r.url) || '').join('\n'));
    }
    rows.push(row);
  }
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
      const aDate=Date.parse(a.loggedDate || ''),bDate=Date.parse(b.loggedDate || '');
      if(Number.isFinite(aDate) && Number.isFinite(bDate))return sign*(aDate-bDate) || a.title.localeCompare(b.title);
      if(Number.isFinite(aDate))return -1;
      if(Number.isFinite(bDate))return 1;
      if(Number.isInteger(a.loggedOrder) && Number.isInteger(b.loggedOrder))return -sign*(a.loggedOrder-b.loggedOrder);
      return a.title.localeCompare(b.title);
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
    if(match && Number.isFinite(date.getTime())) {
      const guid=item.getElementsByTagName('guid')[0]?.textContent || '';
      const text=guid && !guid.startsWith('letterboxd-review-') ? '' : reviewHtmlText(item.getElementsByTagName('description')[0]?.textContent || '');
      const ratingText=item.getElementsByTagName('letterboxd:memberRating')[0]?.textContent;
      const rating=ratingText ? Number(ratingText) : null;
      const url=validReviewUrl(link);
      const review=text && url ? {id:url,url,date:date.toISOString(),watchedDate:releaseDate(item.getElementsByTagName('letterboxd:watchedDate')[0]?.textContent),rating:Number.isFinite(rating) && rating>=.5 && rating<=5 ? rating : null,text,source:'rss'} : null;
      entries.push({path:`/film/${match[1]}/`,loggedDate:date.toISOString(),review});
    }
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
  const reviewsCsv=zipEntry(bytes,'reviews.csv');
  if(reviewsCsv!==null) {
    const [headers,...rows]=csvRows(reviewsCsv);const byFilm=new Map();
    if(!['Name','Year','Review','Letterboxd URI'].every(name=>headers.includes(name)))throw new Error('Invalid reviews.csv in export.');
    for(const row of rows) {
      const text=(row[headers.indexOf('Review')] || '').trim();if(!text)continue;
      const url=validReviewUrl(row[headers.indexOf('Letterboxd URI')]);
      if(!url)throw new Error('Invalid review link in export.');
      const key=`${row[headers.indexOf('Name')]}\u0000${row[headers.indexOf('Year')]}`;
      const value=row[headers.indexOf('Rating')],rating=value ? Number(value) : null;
      const review={id:url,url,date:releaseDate(row[headers.indexOf('Date')]),watchedDate:releaseDate(row[headers.indexOf('Watched Date')]),rating:Number.isFinite(rating) && rating>=.5 && rating<=5 ? rating : null,text,source:'export'};
      byFilm.set(key,mergeReviews(byFilm.get(key) || [],[review]));
    }
    for(const film of films)film.reviews=byFilm.get(`${film.title}\u0000${film.year}`) || [];
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
  onload() {
    const root=this.containerEl;
    root.setAttribute('contenteditable','false');
    for(const name of ['pointerdown','mousedown','click','dblclick'])this.registerDomEvent(root,name,event=>event.stopPropagation());
    this.registerDomEvent(root,'keydown',event=>{
      if(!event.metaKey && !event.ctrlKey && !event.altKey && event.target.closest?.('input,select,textarea,button,summary'))event.stopPropagation();
    });
    this.plugin.blocks.add(this);this.render();
  }
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
        row.createSpan({ text: film.rating == null ? '—' : `${film.rating} ★`, cls: 'lb-rating', attr: { 'aria-label': film.rating == null ? 'Not rated by you' : `Your rating: ${film.rating} out of 5` } });
        row.createSpan({ text: film.average == null ? '—' : film.average.toFixed(2), cls: 'lb-rating lb-community', attr: { 'aria-label': film.average == null ? 'Letterboxd average unavailable' : `Letterboxd average: ${film.average.toFixed(2)} out of 5` } });
        const reviews=mergeReviews([],film.reviews || []);
        if(reviews.length || film.loggedDate) {
          const details=row.createEl('details',{cls:'lb-reviews lb-film-details'});
          details.createEl('summary',{text:reviews.length===1 ? 'Review' : reviews.length ? `Reviews (${reviews.length})` : 'Details'});
          if(film.loggedDate)details.createDiv({text:loggedLabel(film),cls:'lb-film-logged'});
          let lastWatchedDate=null;
          for(const review of reviews) {
            const entry=details.createDiv({cls:'lb-review'});
            if(review.watchedDate && review.watchedDate!==lastWatchedDate)entry.createDiv({text:`Watched ${review.watchedDate}`,cls:'lb-review-meta'});
            lastWatchedDate=review.watchedDate;
            entry.createDiv({text:review.text,cls:'lb-review-text'});
          }
        }

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
class LibraryView extends ItemView {
  constructor(leaf,plugin) {super(leaf);this.plugin=plugin;}
  getViewType() {return LIBRARY_VIEW;}
  getDisplayText() {return 'Letterboxd Library';}
  getIcon() {return 'clapperboard';}
  async onOpen() {
    this.contentEl.empty();this.contentEl.addClass('lb-side-panel');
    this.block=new LibraryBlock(this.contentEl.createDiv(),this.plugin);
    this.addChild(this.block);
  }
  async onClose() {
    if(this.block){this.removeChild(this.block);this.block=null;}
    this.contentEl.empty();
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
    new Setting(el).setName('Export library').setDesc('Save the complete saved list as a CSV file in your vault.').addButton(button => button.setButtonText('Export CSV').setDisabled(!p.activeFilms().length).onClick(() => p.showExportOptions()));
    new Setting(el).setName('Library').addButton(button => button.setButtonText('Open side panel').onClick(() => p.openView())).addButton(button => button.setButtonText('Open note').onClick(() => p.openNote()));
}
module.exports = class LetterboxdLibrary extends Plugin {
  async onload() {
    this.unloaded=false; this.blocks = new Set(); this.syncing = false; this.error = ''; this.progress = '';
    const saved = await this.loadData() || {};
    this.settings = { ...DEFAULT_SETTINGS, ...saved.settings };
    this.data = { films: [], lastSync: null, username: '', ...saved };
    this.addSettingTab(new LibrarySettings(this.app, this));
    this.registerView(LIBRARY_VIEW,leaf=>new LibraryView(leaf,this));
    this.registerMarkdownCodeBlockProcessor('letterboxd-library', (_source,el,ctx) => ctx.addChild(new LibraryBlock(el,this)));
    this.addCommand({ id: 'open-library', name: 'Open library', callback: () => this.openView() });
    this.addCommand({ id: 'open-library-note', name: 'Open library note', callback: () => this.openNote() });
    this.addCommand({ id: 'refresh-library', name: 'Refresh library', callback: () => this.refresh() });
    this.addCommand({ id: 'export-library', name: 'Export library as CSV', callback: () => this.showExportOptions() });
    this.addCommand({ id: 'import-library', name: 'Import export', callback: () => this.chooseImport() });
    this.addRibbonIcon('clapperboard', 'Open Letterboxd library', () => this.openView());
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
  showExportOptions() {
    if(!this.activeFilms().length){new Notice('No films to export.');return;}
    const modal=new Modal(this.app);modal.titleEl.setText('Export library');
    const options={includeRatings:true,includeReviews:false};
    new Setting(modal.contentEl).setName('Include ratings').setDesc('Your ratings, Letterboxd averages and review ratings.').addToggle(toggle=>toggle.setValue(true).onChange(value=>{options.includeRatings=value;}));
    new Setting(modal.contentEl).setName('Include text reviews').setDesc('All stored text reviews, including earlier watches.').addToggle(toggle=>toggle.setValue(false).onChange(value=>{options.includeReviews=value;}));
    new Setting(modal.contentEl).addButton(button=>button.setButtonText('Export CSV').onClick(async()=>{
      button.setDisabled(true);
      const exported=await this.exportLibrary(options);
      if(exported)modal.close();else button.setDisabled(false);
    }));
    modal.open();
  }
  async exportLibrary(options = {}) {
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
      await this.app.vault.create(path,libraryCsv(films,options));
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
  async openView() {
    await this.app.workspace.ensureSideLeaf(LIBRARY_VIEW,'right',{active:true,reveal:true});
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
      const recentByFilm=new Map(),recentReviews=new Map();
      for(const entry of recent) {if(!recentByFilm.has(entry.path))recentByFilm.set(entry.path,entry);if(entry.review)recentReviews.set(entry.path,mergeReviews(recentReviews.get(entry.path) || [],[entry.review]));}
      const liveOrder=[...found.keys()];
      const ordered=[...recentByFilm.keys()].filter(path=>found.has(path)).concat(liveOrder.filter(path=>!recentByFilm.has(path)));
      const ranks=new Map(ordered.map((path,index)=>[path,index]));
      for(const film of found.values()) {film.loggedOrder=ranks.get(film.path);const entry=recentByFilm.get(film.path);if(entry)film.loggedDate=entry.loggedDate;}
      const cache = new Map(this.activeFilms().map(f => [f.path,f]));
      const films = [...found.values()].map(f => ({ ...cache.get(f.path), ...f, runtime: cache.get(f.path)?.runtime ?? f.runtime, reviews:mergeReviews(cache.get(f.path)?.reviews || [],recentReviews.get(f.path) || []) }));
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
module.exports.core = { select, text, kind, parseList, parseRuntime, parseCsv, watchedFromZip, zipEntry, exportData, parseMetadata, smallPoster, stats, filterFilms, validUsername, filmUrl, releaseDate, releaseLabel, libraryCsv, parseRecentLogs, LibraryBlock, validNotePath, loggedLabel, validReviewUrl, mergeReviews, reviewHtmlText, LibraryView };
