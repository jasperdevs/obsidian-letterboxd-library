const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { JSDOM } = require('jsdom');

function harness() {
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/' });
  const { document, HTMLElement } = dom.window;
  HTMLElement.prototype.empty = function () { this.replaceChildren(); };
  HTMLElement.prototype.addClass = function (name) { this.classList.add(name); };
  HTMLElement.prototype.setText = function (text) { this.textContent = text; };
  HTMLElement.prototype.createEl = function (tag, options = {}) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(options)) {
      if (key === 'text') el.textContent = value;
      else if (key === 'cls') el.className = value;
      else if (key === 'attr') for (const [attr, v] of Object.entries(value)) el.setAttribute(attr, v);
      else el.setAttribute(key, value);
    }
    this.append(el); return el;
  };
  HTMLElement.prototype.createDiv = function (options) { return this.createEl('div', options); };
  HTMLElement.prototype.createSpan = function (options) { return this.createEl('span', options); };
  const notices = [], copies = [], requests = [], routes = new Map(), files = new Map(), menus = [];
  const app = {
    vault: {
      getAbstractFileByPath: p => files.has(p) ? { path: p } : null,
      create: async (p, content) => { assert.ok(!files.has(p)); files.set(p, content); return { path: p }; },
      createFolder: async p => { files.set(p, null); }
    },
    workspace: { getLeaf: () => ({ openFile: async file => { app.openedFile = file.path; } }) }
  };
  class Plugin {
    constructor() { this.app = app; this.saved = null; this.commands = []; }
    async loadData() { return this.saved; }
    async saveData(data) { this.saved = JSON.parse(JSON.stringify(data)); }
    registerView(type,creator) { this.viewFactory=creator; }
    addSettingTab(tab) { this.settingsTab = tab; }
    registerMarkdownCodeBlockProcessor(language, callback) { this.processor = callback; }
    addCommand(command) { this.commands.push(command); }
    addRibbonIcon() {}
  }
  class Child { constructor(el) { this.containerEl = el; } registerDomEvent(el,name,handler) {el.addEventListener(name,handler);} }
  class SettingsTab { constructor(app, plugin) { this.app = app; this.plugin = plugin; this.containerEl = document.createElement('div'); } }
  class Modal {
    constructor() { this.contentEl = document.createElement('div'); this.titleEl = document.createElement('div'); app.modal = this; }
    open() { document.body.append(this.contentEl); }
    close() { this.contentEl.remove(); this.closed=true; }
  }
  class ItemView {
    constructor(leaf) {this.leaf=leaf;this.contentEl=document.createElement('div');}
    addChild(child) {child.onload();}
    removeChild(child) {child.onunload();}
  }
  class Setting {
    constructor(parent) { this.el = parent.createDiv(); }
    setName(name) { this.el.createSpan({ text: name }); return this; }
    setDesc(desc) { this.el.createSpan({ text: desc }); return this; }
    add(kind, callback) {
      const el = this.el.createEl(kind === 'button' ? 'button' : 'input');
      if (kind === 'toggle') el.type = 'checkbox';
      const component = {
        setValue(value) { if (kind === 'toggle') el.checked = value; else el.value = value; return this; },
        setPlaceholder(value) { el.placeholder = value; return this; },
        setButtonText(value) { el.textContent = value; return this; },
        setDisabled(value) { el.disabled = value; return this; },
        onChange(callback) { el.addEventListener('change', () => callback(kind === 'toggle' ? el.checked : el.value)); return this; },
        onClick(callback) { el.onclick = callback; return this; }
      };
      callback(component); return this;
    }
    addText(callback) { return this.add('text', callback); }
    addToggle(callback) { return this.add('toggle', callback); }
    addButton(callback) { return this.add('button', callback); }
  }
  class Menu {
    constructor() { this.items = []; menus.push(this); }
    addItem(callback) { const item = { setTitle(value) { this.title = value; return this; }, onClick(value) { this.action = value; return this; } }; callback(item); this.items.push(item); return this; }
    showAtMouseEvent() {}
  }
  const api = { Plugin, PluginSettingTab: SettingsTab, Setting, Menu, Modal, ItemView, MarkdownRenderChild: Child,
    Notice: class { constructor(message) { notices.push(message); } },
    setIcon: (el, icon) => { el.dataset.icon = icon; },
    requestUrl: async ({ url }) => { requests.push(url); const response = routes.get(url); if (!response) return { status: 403, text: 'blocked' }; return typeof response === 'function' ? response() : response; }
  };
  const sandbox = { URL, document, DOMParser: dom.window.DOMParser, navigator: { clipboard: { writeText: async value => copies.push(value) } }, module: { exports: {} }, require: name => name === 'obsidian' ? api : require(name) };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8'), sandbox);
  const plugin = new sandbox.module.exports();
  app.workspace.ensureSideLeaf=async(type,side,options)=>{app.sideRequest={type,side,options};app.libraryView=plugin.viewFactory({});await app.libraryView.onOpen();return app.libraryView;};
  function render() {
    const root = document.createElement('div'); document.body.append(root);
    plugin.processor('', root, { addChild: child => { child.onload(); } }); return root;
  }
  return { plugin, core: sandbox.module.exports.core, document, dom, notices, copies, requests, routes, files, menus, app, render };
}
function list(items, count, next) {
  return `<h1 class="section-heading"><span class="tooltip" title="${count} films"></span></h1><ul>${items.map(([slug,title,year,rating]) => `<li><div data-component-class="LazyPoster" data-item-link="/film/${slug}/" data-item-name="${title} (${year})"></div>${rating ? `<span class="rating rated-${rating*2}"></span>` : ''}</li>`).join('')}</ul>${next ? `<div class="paginate-nextprev"><a class="next" href="${next}">Next</a></div>` : ''}`;
}
function metadata(runtime) {
  return { status: 200, text: `<script type="application/ld+json">{"@type":"Movie","image":"https://a.ltrbxd.com/example-0-600-0-900-crop.jpg","dateCreated":"2020-06-01","aggregateRating":{"ratingValue":3.8}}</script>"duration":"PT${runtime}M"` };
}
function setupRoutes(h) {
  h.routes.set('https://letterboxd.com/reader_one/films/by/date/', { status: 200, text: list([['beta','Beta',2021,4]],3,'/reader_one/films/by/date/page/2/') });
  h.routes.set('https://letterboxd.com/reader_one/films/by/date/page/2/', { status: 200, text: list([['alpha','Alpha',2020,5],['short','Short',1900,null]],3) });
  h.routes.set('https://letterboxd.com/reader_one/rss/', { status: 200, text: '<rss><channel><item><link>https://letterboxd.com/reader_one/film/alpha/</link><pubDate>Wed, 28 Oct 2026 09:00:00 GMT</pubDate></item></channel></rss>' });
  for(const [slug,runtime] of [['alpha',90],['beta',100],['short',10]]) h.routes.set(`https://letterboxd.com/film/${slug}/`,metadata(runtime));
}
async function loaded() {
  const h=harness(); await h.plugin.onload(); await h.plugin.saveSettings({username:'reader_one'}); setupRoutes(h); assert.equal(await h.plugin.refresh(),true); return h;
}

test('fresh install opens a generic note and public settings without internal APIs', async () => {
  const h=harness(); await h.plugin.onload(); await h.plugin.openNote(); const root=h.render();
  assert.equal(h.app.openedFile,'Letterboxd.md'); assert.equal(h.plugin.activeFilms().length,0); assert.match(root.textContent,/Set your Letterboxd username/);
  h.plugin.openSettings(); assert.match(h.app.modal.contentEl.textContent,/Refresh before copying/); assert.equal(h.app.modal.contentEl.querySelector('input[type=checkbox]').checked,true);
  assert.doesNotMatch(h.app.modal.contentEl.textContent,/reader_one|reader_two/);
});
test('multi-page refresh reads all watched films, promotes recent logs, and keeps the library free of stats', async () => {
  const h=await loaded(), root=h.render();
  assert.equal(h.plugin.data.films.length,3); assert.equal(root.querySelector('[aria-label="Sort films"]').value,'logged');assert.equal(root.querySelector('[aria-label="Sort direction"]').value,'desc');
  assert.equal(root.querySelector('.lb-film-title').textContent,'Alpha');assert.equal(root.querySelectorAll('.lb-film').length,3);assert.equal(root.querySelector('.lb-overview'),null);
  assert.equal(root.querySelectorAll('.lb-stat-value').length,0);assert.equal(root.querySelectorAll('.lb-poster img').length,3);assert.equal(root.querySelectorAll('.lb-film-logged').length,1);assert.match(root.querySelector('.lb-film-logged').textContent,/Logged .*2026/);
  const statsButton=[...root.querySelectorAll('button')].find(b=>b.textContent==='Stats');statsButton.click();
  assert.match(root.textContent,/Collection · 3 films/);assert.equal(root.querySelectorAll('.lb-format-legend').length,1);
  assert.equal(root.querySelectorAll('.lb-chart-panel').length,2);
});
test('copy uses a fresh snapshot; filters, direction, and resetting work with real DOM events', async () => {
  const h=await loaded(), root=h.render();
  const search=root.querySelector('input[type=search]');search.value='Beta';search.dispatchEvent(new h.dom.window.Event('input'));
  assert.equal(root.querySelectorAll('.lb-film').length,1);
  [...root.querySelectorAll('button')].find(b=>b.textContent==='Copy').click();await h.menus.at(-1).items[0].action();
  assert.equal(h.copies.at(-1).split('\n').length,3);assert.ok(h.requests.filter(u=>u.endsWith('/films/by/date/')).length>=2);
  [...root.querySelectorAll('button')].find(b=>b.textContent==='Reset').click();assert.equal(root.querySelectorAll('.lb-film').length,3);
  assert.equal(root.querySelector('[aria-label="Sort films"]').value,'logged');assert.equal(root.querySelector('[aria-label="Sort direction"]').value,'desc');
});
test('failed second page cannot replace the complete saved library', async () => {
  const h=await loaded(), before=JSON.stringify(h.plugin.data);
  h.routes.delete('https://letterboxd.com/reader_one/films/by/date/page/2/');assert.equal(await h.plugin.refresh(),false);assert.equal(JSON.stringify(h.plugin.data),before);
});
test('account changes cannot leak the previous account into the view, copy or export', async () => {
  const h=await loaded();await h.plugin.saveSettings({username:'reader_two'});const root=h.render();
  assert.equal(h.plugin.activeFilms().length,0);assert.equal(root.querySelectorAll('.lb-film').length,0);assert.equal(await h.plugin.exportLibrary(),null);
  assert.equal(h.plugin.data.username,'reader_one');await h.plugin.saveSettings({username:'reader_one'});assert.equal(h.plugin.activeFilms().length,3);
});
test('full export is independent of visible filters and never overwrites previous files', async () => {
  const h=await loaded();const first=await h.plugin.exportLibrary(),second=await h.plugin.exportLibrary();
  assert.notEqual(first,second);assert.match(second,/\(2\)/);assert.equal(h.files.get(first).split('\r\n').filter(Boolean).length,4);
});
test('unloading while refresh runs prevents late data writes', async () => {
  const h=await loaded(), before=JSON.stringify(h.plugin.data);let resume;
  const url='https://letterboxd.com/reader_one/films/by/date/';const response=h.routes.get(url);
  h.routes.set(url,()=>new Promise(resolve=>{resume=()=>resolve(response);}));const pending=h.plugin.refresh();h.plugin.onunload();resume();
  assert.equal(await pending,false);assert.equal(JSON.stringify(h.plugin.data),before);
});
test('a second reader can import CSV from an empty installation and sort newest logged first', async () => {
  const h=harness();await h.plugin.onload();await h.plugin.saveSettings({username:'reader_two'});
  h.routes.set('https://boxd.it/A1',metadata(100));h.routes.set('https://boxd.it/B2',metadata(15));
  await h.plugin.importFile({name:'watched.csv',size:160,text:async()=> 'Date,Name,Year,Letterboxd URI\n2026-01-01,Older log,2025,https://boxd.it/A1\n2026-10-28,New log,1900,https://boxd.it/B2\n'});
  assert.equal(h.plugin.data.username,'reader_two');assert.equal(h.plugin.activeFilms().length,2);
  const root=h.render();assert.equal(root.querySelector('.lb-film-title').textContent,'New log');
  assert.equal(h.plugin.activeFilms().filter(f=>h.core.kind(f)==='short').length,1);
  assert.ok(!JSON.stringify(h.plugin.saved).includes('reader_one'));
});
test('export log dates use diary entry dates instead of release years', async () => {
  const h=await loaded();const films=h.core.parseCsv('Date,Name,Year,Letterboxd URI\n2026-10-28,Old film,1888,https://boxd.it/A1\n2020-01-01,New film,2026,https://boxd.it/B2\n');
  assert.equal(h.core.filterFilms(films,{sort:'logged',direction:'desc'})[0].title,'Old film');
  assert.equal(h.core.validNotePath('Notes\\Letterboxd.md'),'Notes/Letterboxd.md');
  assert.throws(()=>h.core.validNotePath('../outside.md'));assert.throws(()=>h.core.validNotePath('C:/outside.md'));
});
function exportZip(files) {
  const local=[],directory=[];let offset=0;
  const crc32=data=>{let crc=0xffffffff;for(const byte of data){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
  for(const [name,content] of Object.entries(files)) {
    const filename=Buffer.from(name),data=Buffer.from(content),crc=crc32(data);
    const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt32LE(crc,14);header.writeUInt32LE(data.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(filename.length,26);
    local.push(header,filename,data);
    const entry=Buffer.alloc(46);entry.writeUInt32LE(0x02014b50);entry.writeUInt16LE(20,4);entry.writeUInt16LE(20,6);entry.writeUInt32LE(crc,16);entry.writeUInt32LE(data.length,20);entry.writeUInt32LE(data.length,24);entry.writeUInt16LE(filename.length,28);entry.writeUInt32LE(offset,42);
    directory.push(entry,filename);offset+=30+filename.length+data.length;
  }
  const central=Buffer.concat(directory),end=Buffer.alloc(22),count=Object.keys(files).length;
  end.writeUInt32LE(0x06054b50);end.writeUInt16LE(count,8);end.writeUInt16LE(count,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...local,central,end]);
}
function reviewFixture() {
  return exportZip({
    'watched.csv':'Date,Name,Year,Letterboxd URI\n2026-01-01,Alpha,2020,https://boxd.it/A1\n2026-10-01,Beta,2021,https://boxd.it/B2\n',
    'profile.csv':'Username,Email Address\nreader_two,private@example.test\n',
    'ratings.csv':'Name,Year,Rating\nAlpha,2020,4.5\n',
    'reviews.csv':'Date,Name,Year,Letterboxd URI,Rating,Review,Watched Date\n2026-01-01,Alpha,2020,https://boxd.it/revOne,4,"First review, with a comma.",2026-01-01\n2026-10-01,Alpha,2020,https://boxd.it/revTwo,3.5,"Second review\nwith a new line and ""quotes"".",2026-09-30\n2026-10-01,Beta,2021,https://boxd.it/revEmpty,2,,2026-09-30\n'
  });
}
test('complete ZIP imports every text review and preserves repeat-watch review ratings',()=>{
  const h=harness(),data=h.core.exportData(reviewFixture());
  assert.equal(data.username,'reader_two');assert.equal(data.films[0].reviews.length,2);assert.equal(data.films[1].reviews.length,0);
  assert.equal(data.films[0].reviews[0].rating,3.5);assert.equal(data.films[0].reviews[1].rating,4);assert.match(data.films[0].reviews[0].text,/new line and "quotes"/);
  assert.equal(data.films[0].rating,4.5);assert.ok(!JSON.stringify(data).includes('private@example.test'));
});
test('review sections start collapsed, render unsafe text inertly, and do not affect title-only copying',async()=>{
  const h=await loaded();const raw='<img src=x onerror=alert(1)>This is my review.';
  h.plugin.data.films[0].reviews=[{id:'one',text:raw,rating:4,date:'2026-10-01',source:'export'},{id:'two',text:'Another watch',rating:3,date:'2026-01-01',source:'export'}];
  const root=h.render(),details=[...root.querySelectorAll('details.lb-reviews')].find(d=>d.querySelector('.lb-review-text'));
  assert.ok(details);assert.equal(details.open,false);assert.equal(details.querySelector('summary').textContent,'Reviews (2)');
  assert.equal(details.querySelectorAll('.lb-review').length,2);assert.equal(details.querySelector('.lb-review-text').textContent,raw);assert.equal(details.querySelector('img,script'),null);
  h.plugin.settings.refreshBeforeCopy=false;await h.plugin.copyFilms('all');assert.equal(h.copies.at(-1),'Alpha (2020)\nBeta (2021)\nShort (1900)');
});
test('RSS text is sanitized, watch-only events are not reviews, and stored review history survives refresh',async()=>{
  const h=await loaded();
  h.plugin.data.films.find(f=>f.path==='/film/alpha/').reviews=[{id:'old',text:'Historical review',rating:3,date:'2020-01-01',source:'export'}];
  h.routes.set('https://letterboxd.com/reader_one/rss/',{status:200,text:'<rss xmlns:letterboxd="https://letterboxd.com"><channel><item><guid>letterboxd-review-123</guid><link>https://letterboxd.com/reader_one/film/alpha/</link><pubDate>Wed, 28 Oct 2026 09:00:00 GMT</pubDate><letterboxd:memberRating>4.5</letterboxd:memberRating><letterboxd:watchedDate>2026-10-27</letterboxd:watchedDate><description><![CDATA[<p><img src="https://example.test/poster.jpg"></p><p>New <em>review</em>.<br>Second line.</p><script>bad()</script>]]></description></item><item><guid>letterboxd-watch-124</guid><link>https://letterboxd.com/reader_one/film/beta/</link><pubDate>Wed, 28 Oct 2026 08:00:00 GMT</pubDate><description><![CDATA[<p>Watched on Tuesday October 27, 2026.</p>]]></description></item></channel></rss>'});
  await h.plugin.refresh();await h.plugin.refresh();
  const alpha=h.plugin.data.films.find(f=>f.path==='/film/alpha/');assert.equal(alpha.reviews.length,2);assert.equal(alpha.reviews[0].text,'New review.\nSecond line.');assert.equal(alpha.reviews[0].rating,4.5);
  assert.equal(h.plugin.data.films.find(f=>f.path==='/film/beta/').reviews.length,0);
});
test('review merge joins export/RSS aliases but keeps distinct review history',()=>{
  const h=harness();const review={id:'export',url:'https://boxd.it/R1',source:'export',text:'Same text',date:'2026-10-28',watchedDate:'2026-10-27',rating:4};
  const rss={...review,id:'rss',source:'rss',url:'https://letterboxd.com/reader_one/film/alpha/',date:'2026-10-28T12:00:00Z'};
  assert.equal(h.core.mergeReviews([review],[rss]).length,1);
  assert.equal(h.core.mergeReviews([review],[{...review,id:'other',url:'https://boxd.it/R2',date:'2025-01-01',watchedDate:'2025-01-01'}]).length,2);
});
test('all four CSV export choices include or omit review text and ratings independently',()=>{
  const h=harness();const film=h.core.exportData(reviewFixture()).films[0];film.average=3.8;
  for(const includeReviews of [false,true])for(const includeRatings of [false,true]) {
    const csv=h.core.libraryCsv([film],{includeReviews,includeRatings});
    assert.equal(csv.includes('"Reviews"'),includeReviews);assert.equal(csv.includes('Second review'),includeReviews);
    assert.equal(csv.includes('"Your rating"'),includeRatings);assert.equal(csv.includes('"Letterboxd average"'),includeRatings);
    assert.equal(csv.includes('3.5/5'),includeReviews && includeRatings);assert.equal(csv.includes('4/5'),includeReviews && includeRatings);
  }
});
test('export dialog makes text reviews opt-in and offers an independent ratings switch',async()=>{
  const h=await loaded();h.plugin.showExportOptions();const toggles=h.app.modal.contentEl.querySelectorAll('input[type=checkbox]');
  assert.equal(toggles.length,2);assert.equal(toggles[0].checked,true);assert.equal(toggles[1].checked,false);
});
test('side panel works while a source-mode note remains open and releases its component on close',async()=>{
  const h=await loaded();h.app.openedFile='Writing.md';h.app.workspace.editorMode='source';
  await h.plugin.openView();assert.equal(h.app.openedFile,'Writing.md');assert.equal(h.app.workspace.editorMode,'source');assert.equal(h.app.sideRequest.side,'right');
  assert.equal(h.app.libraryView.getViewType(),'letterboxd-library-view');assert.equal(h.app.libraryView.contentEl.querySelectorAll('.lb-film').length,3);assert.equal(h.plugin.blocks.size,1);
  await h.app.libraryView.onClose();assert.equal(h.plugin.blocks.size,0);
});
test('dates stay inside closed details and reviews do not repeat ratings or external links',async()=>{
  const h=await loaded();const film=h.plugin.data.films.find(f=>f.path==='/film/alpha/');film.reviews=[{id:'r',text:'Text review',rating:film.rating,watchedDate:'2026-10-27',date:'2026-10-28',url:'https://boxd.it/R1',source:'export'}];
  const root=h.render(),row=[...root.querySelectorAll('.lb-film')].find(row=>row.textContent.includes('Alpha'));
  const details=row.querySelector('details');assert.equal(details.open,false);assert.ok(row.querySelector('.lb-film-logged').closest('details'));
  assert.equal(row.querySelectorAll('.lb-rating').length,2);assert.equal(details.querySelectorAll('.lb-rating').length,0);
  assert.equal(details.querySelectorAll('a').length,0);assert.ok(!details.textContent.includes('View on Letterboxd'));
  assert.equal(row.querySelectorAll('.lb-review-meta').length,1);
});
test('Live Preview controls do not send mouse or typing events to the note editor',async()=>{
  const h=await loaded(),root=h.render(),editor=h.document.createElement('div');root.parentNode.replaceChild(editor,root);editor.append(root);
  let mouseEvents=0,typingEvents=0,shortcuts=0;
  editor.addEventListener('mousedown',()=>mouseEvents++);editor.addEventListener('keydown',event=>{if(event.metaKey)shortcuts++;else typingEvents++;});
  const input=root.querySelector('input');input.dispatchEvent(new h.dom.window.MouseEvent('mousedown',{bubbles:true}));input.dispatchEvent(new h.dom.window.KeyboardEvent('keydown',{key:'a',bubbles:true}));
  assert.equal(mouseEvents,0);assert.equal(typingEvents,0);assert.equal(root.getAttribute('contenteditable'),'false');
  input.dispatchEvent(new h.dom.window.KeyboardEvent('keydown',{key:'p',metaKey:true,bubbles:true}));assert.equal(shortcuts,1);
  const details=root.querySelector('details');details.querySelector('summary').click();assert.equal(details.open,true);
});
