const $ = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };
const storeKey = 'old-messenger-v1';
const hues = ['#ffb15a', '#ffd9a0', '#f08a5d', '#e8c9a0', '#ff8a1e', '#c9a27a'];
const seedPeople = [
  { id: 'maya', name: 'Maya Chen', handle: 'maya', bio: 'night markets & voice notes', followers: 12840, following: 312, online: true, bday: 'Oct 9' },
  { id: 'leo', name: 'Leo Okonkwo', handle: 'leo', bio: 'building communities', followers: 902, following: 140, online: true, bday: 'Nov 2' },
  { id: 'aria', name: 'Aria Sol', handle: 'aria', bio: 'status poet', followers: 44021, following: 88, online: false, bday: 'Oct 6' },
  { id: 'nile', name: 'Nile Park', handle: 'nile', bio: 'calls from the web', followers: 2201, following: 501, online: true, bday: 'Jan 14' },
  { id: 'channel', name: 'Old Radio', handle: 'oldradio', bio: 'channel daily drops', followers: 91000, following: 1, online: false, channel: true }
];
function load() {
  const raw = localStorage.getItem(storeKey);
  if (raw) return JSON.parse(raw);
  const data = {
    users: [{ username: 'demo', password: 'demo123', name: 'Demo', handle: 'demo', bio: 'testing Old', followers: 240, followingIds: ['maya', 'aria'] }],
    session: null,
    chats: [
      { id: 'c1', title: 'Maya Chen', peer: 'maya', kind: 'dm', restricted: false, disappearing: false, unread: 2, preview: 'send the voice note', time: '2m', messages: [
        { id: 'm1', from: 'maya', text: 'the channel status is up for 24h', time: '9:12' },
        { id: 'm2', from: 'me', text: 'saving it to my status', time: '9:14', status: 'read' },
        { id: 'm3', from: 'maya', text: 'send the voice note', time: '9:18', reactions: ['fire'] }
      ]},
      { id: 'c2', title: 'Night Market', peer: null, kind: 'group', tag: 'hosts', unread: 0, preview: 'Leo: event reminder Friday', time: '1h', messages: [
        { id: 'g1', from: 'leo', text: 'event reminder Friday rooftop', time: '8:02', reactions: ['party'] }
      ]},
      { id: 'c3', title: 'Old Radio', peer: 'channel', kind: 'channel', unread: 1, preview: 'Channel status amber hour', time: '3h', messages: [
        { id: 'ch1', from: 'channel', text: 'Channel status is live. Like or reshare to your status.', time: '6:40' }
      ]},
      { id: 'c4', title: 'Aria Sol', peer: 'aria', kind: 'dm', restricted: true, unread: 0, preview: 'restricted chat linked devices off', time: 'yday', messages: [
        { id: 'a1', from: 'aria', text: 'this chat stays on this device', time: '22:11' }
      ]}
    ],
    statuses: [
      { id: 's1', author: 'maya', kind: 'photo', text: 'amber hour', hue: 0, likes: 42, ago: '2h' },
      { id: 's2', author: 'aria', kind: 'text', text: 'leave the unread on purpose', hue: 2, likes: 128, ago: '4h' },
      { id: 's3', author: 'channel', kind: 'text', text: 'Channel status daily drop', hue: 4, likes: 900, ago: '5h', channel: true }
    ],
    posts: [
      { id: 'p1', author: 'aria', text: 'for you: a thread that disappears like a status', hue: 1, likes: 2301, comments: 88, audience: 'foryou' },
      { id: 'p2', author: 'maya', text: 'friends only voice-note walk home', hue: 3, likes: 410, comments: 21, audience: 'friends' },
      { id: 'p3', author: 'leo', text: 'following feed: community event Friday', hue: 0, likes: 96, comments: 14, audience: 'following' },
      { id: 'p4', author: 'nile', text: 'web calling is in. tap the phone.', hue: 5, likes: 640, comments: 40, audience: 'foryou' }
    ],
    follows: { demo: ['maya', 'aria'] }
  };
  localStorage.setItem(storeKey, JSON.stringify(data));
  return data;
}
let db = load();
const save = () => localStorage.setItem(storeKey, JSON.stringify(db));
const me = () => db.users.find(u => u.username === db.session);
const person = (id) => seedPeople.find(p => p.id === id) || { name: id, handle: id };
const state = { tab: 'chats', filter: 'all', feed: 'foryou', chatId: null, sheet: null, call: null, authMode: 'in' };
function avatar(name, size = '') {
  const hue = hues[(name || 'A').charCodeAt(0) % hues.length];
  return `<div class="ava ${size}" style="background:${hue}">${(name || '?').slice(0, 1)}</div>`;
}
function render() {
  const root = document.getElementById('root');
  root.innerHTML = '';
  if (!db.session) root.append(auth());
  else root.append(shell());
}
function auth() {
  const node = document.createElement('section');
  node.className = 'screen auth';
  node.innerHTML = `<div class="mark"><div class="orb"></div> Old · Oct 2026</div><h1>Messages with a pulse.</h1><p class="sub">WhatsApp depth. TikTok scroll. Suno light. Username first.</p><div class="tabs"><button data-m="in" class="${state.authMode === 'in' ? 'on' : ''}">Sign in</button><button data-m="up" class="${state.authMode === 'up' ? 'on' : ''}">Create</button></div><label>Username</label><input id="user" placeholder="demo" autocomplete="username" /><label>Password</label><input id="pass" type="password" placeholder="demo123" /><div class="err" id="err"></div><button class="primary" id="go">${state.authMode === 'in' ? 'Enter Old' : 'Create username'}</button><button class="social" disabled>Continue with Google · disabled for testing</button><button class="social" disabled>Continue with Apple · disabled for testing</button><p class="note">Seed login: demo / demo123. Social sign-in stays off until you wire providers.</p>`;
  node.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { state.authMode = b.dataset.m; render(); });
  node.querySelector('#go').onclick = () => {
    const username = node.querySelector('#user').value.trim().toLowerCase();
    const password = node.querySelector('#pass').value;
    const err = node.querySelector('#err');
    if (!username || password.length < 4) { err.textContent = 'Username and a 4+ character password.'; return; }
    if (state.authMode === 'up') {
      if (db.users.some(u => u.username === username)) { err.textContent = 'That username exists.'; return; }
      db.users.push({ username, password, name: username, handle: username, bio: 'new on Old', followers: 0, followingIds: [] });
    } else {
      const u = db.users.find(x => x.username === username && x.password === password);
      if (!u) { err.textContent = 'No match. Try demo / demo123.'; return; }
    }
    db.session = username; save(); render();
  };
  return node;
}
function shell() {
  const node = document.createElement('section'); node.className = 'screen';
  if (state.call) { node.append(callView()); return node; }
  if (state.chatId) { node.append(thread()); return node; }
  if (state.tab === 'chats') node.append(chats());
  if (state.tab === 'feed') node.append(feed());
  if (state.tab === 'status') node.append(statusView());
  if (state.tab === 'calls') node.append(calls());
  if (state.tab === 'profile') node.append(profile());
  node.append(dock());
  if (state.sheet) node.append(sheet());
  return node;
}
function dock() {
  const d = document.createElement('nav'); d.className = 'dock';
  [['chats','Chats'],['feed','For You'],['status','Status'],['calls','Calls'],['profile','Profile']].forEach(([id,label]) => {
    const b = document.createElement('button'); b.textContent = label; if (state.tab === id) b.className = 'on';
    b.onclick = () => { state.tab = id; render(); }; d.append(b);
  });
  return d;
}
function chats() {
  const n = document.createElement('div'); n.className = 'screen';
  const filters = ['all','unread','channels','groups','communities'];
  n.innerHTML = `<div class="top"><div><div class="tag">Chats · channels inside</div><h2>Old</h2></div><button class="iconbtn" id="new">+</button></div><div class="pills">${filters.map(f => `<button data-f="${f}" class="${state.filter===f?'on':''}">${f}</button>`).join('')}</div><div class="list" id="list"></div>`;
  n.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { state.filter = b.dataset.f; render(); });
  n.querySelector('#new').onclick = () => { state.sheet = 'newchat'; render(); };
  const list = n.querySelector('#list');
  let items = db.chats.slice();
  if (state.filter === 'unread') items = items.filter(c => c.unread);
  if (state.filter === 'channels') items = items.filter(c => c.kind === 'channel');
  if (state.filter === 'groups' || state.filter === 'communities') items = items.filter(c => c.kind === 'group');
  items.forEach(c => {
    const row = document.createElement('button'); row.className = 'row'; row.style.cssText = 'width:100%;border:0;background:transparent;text-align:left';
    row.innerHTML = `${avatar(c.title)}<div class="meta"><b>${c.title} ${c.restricted ? '· restricted' : ''} ${c.kind === 'channel' ? '· channel' : ''}</b><span>${c.preview}</span></div><div><div class="time">${c.time}</div>${c.unread ? `<div class="badge">${c.unread}</div>` : ''}</div>`;
    row.onclick = () => { c.unread = 0; state.chatId = c.id; save(); render(); }; list.append(row);
  });
  list.insertAdjacentHTML('beforeend', '<div class="tag" style="padding:8px">Contacts · active now</div>');
  seedPeople.filter(p => p.online).forEach(p => {
    const row = document.createElement('div'); row.className = 'row';
    row.innerHTML = `${avatar(p.name)}<div class="meta"><b>${p.name}</b><span>active now${p.bday.startsWith('Oct') ? ' · birthday ' + p.bday : ''}</span></div>`;
    list.append(row);
  });
  return n;
}
function thread() {
  const c = db.chats.find(x => x.id === state.chatId);
  const n = document.createElement('section'); n.className = 'thread';
  n.innerHTML = `<div class="thead"><button class="iconbtn" id="back">←</button>${avatar(c.title,'sm')}<div class="meta"><b>${c.title}</b><span>${c.kind==='channel'?'channel in chats':c.restricted?'restricted · not on linked devices':'online'}</span></div><button class="iconbtn" id="call">call</button><button class="iconbtn" id="more">⋯</button></div><div class="msgs" id="msgs"></div><div class="composer"><button id="mic" type="button">voice</button><textarea id="box" rows="1" placeholder="${c.kind==='channel'?'channels are broadcast':'Message'}"></textarea><button id="send">Send</button></div>`;
  n.querySelector('#back').onclick = () => { state.chatId = null; render(); };
  n.querySelector('#more').onclick = () => { state.sheet = 'chatmenu'; render(); };
  n.querySelector('#call').onclick = () => { state.call = { peer: c.title, video: false }; render(); };
  const box = n.querySelector('#msgs');
  c.messages.forEach(m => {
    const mine = m.from === 'me';
    const b = document.createElement('div'); b.className = 'bubble' + (mine ? ' me' : '');
    b.innerHTML = `${m.voice ? '<div class="wave">'+Array.from({length:12},(_,i)=>`<i style="height:${8+((i*17)%24)}px"></i>`).join('')+'</div>' : m.text}<small>${m.time}${mine ? ' · ' + (m.status || 'sent') : ''}</small>${m.reactions ? `<div class="reacts">${m.reactions.join(' ')}</div>` : ''}`;
    b.onclick = () => { state.sheet = 'react:' + m.id; render(); }; box.append(b);
  });
  n.querySelector('#send').onclick = () => send(c, n.querySelector('#box').value);
  n.querySelector('#mic').onclick = () => { c.messages.push({ id: 'v'+Date.now(), from: 'me', voice: true, text: 'voice note', time: 'now', status: 'delivered' }); c.preview = 'Voice note'; c.time = 'now'; save(); render(); };
  return n;
}
function send(c, text) {
  text = text.trim(); if (!text || c.kind === 'channel') return;
  c.messages.push({ id: 'x'+Date.now(), from: 'me', text, time: 'now', status: 'sent' });
  c.preview = text; c.time = 'now'; save(); render();
  setTimeout(() => { const msg = c.messages[c.messages.length-1]; if (msg) msg.status = 'read'; save(); if (state.chatId === c.id) render(); }, 700);
}
function sheet() {
  const s = document.createElement('div'); s.className = 'sheet';
  if (state.sheet === 'newchat') {
    s.innerHTML = '<b>New</b><button id="dm">Message a contact</button><button id="grp">Community / group</button><button id="st">Threads-style status</button><button id="x">Close</button>';
    s.querySelector('#dm').onclick = () => { const id = 'c'+Date.now(); db.chats.unshift({ id, title: 'Nile Park', peer: 'nile', kind: 'dm', unread: 0, preview: 'say hi', time: 'now', messages: [] }); state.chatId = id; state.sheet = null; save(); render(); };
    s.querySelector('#grp').onclick = () => { db.chats.unshift({ id: 'g'+Date.now(), title: 'New community', kind: 'group', tag: 'members', unread: 0, preview: 'you created this', time: 'now', messages: [] }); state.sheet = null; save(); render(); };
    s.querySelector('#st').onclick = () => { state.sheet = null; state.tab = 'status'; render(); };
  } else if (state.sheet === 'chatmenu') {
    const c = db.chats.find(x => x.id === state.chatId);
    s.innerHTML = `<b>${c.title}</b><button id="dis">${c.disappearing ? 'Disappearing on' : 'Disappearing messages'}</button><button id="res">${c.restricted ? 'Restricted' : 'Restrict chat'}</button><button id="x">Close</button>`;
    s.querySelector('#dis').onclick = () => { c.disappearing = !c.disappearing; state.sheet = null; save(); render(); };
    s.querySelector('#res').onclick = () => { c.restricted = !c.restricted; state.sheet = null; save(); render(); };
  } else if (String(state.sheet).startsWith('react:')) {
    const id = state.sheet.slice(6); const c = db.chats.find(x => x.id === state.chatId); const m = c.messages.find(x => x.id === id);
    s.innerHTML = `<b>React</b><div style="display:flex;gap:8px;padding:10px 0">${['heart','fire','laugh','star','spark'].map(e => `<button data-e="${e}">${e}</button>`).join('')}</div><button id="x">Close</button>`;
    s.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { m.reactions = [b.dataset.e]; state.sheet = null; save(); render(); });
  } else if (state.sheet === 'composer') {
    s.innerHTML = '<b>Share a status · Threads style</b><textarea id="stxt" rows="3" placeholder="What is happening for 24 hours?"></textarea><div class="pills"><button data-a="foryou" class="on">For you</button><button data-a="friends">Friends</button><button data-a="following">Following</button></div><button class="primary" id="post">Post 24h status</button><button id="x">Close</button>';
    let aud = 'foryou';
    s.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { aud = b.dataset.a; s.querySelectorAll('[data-a]').forEach(x => x.classList.remove('on')); b.classList.add('on'); });
    s.querySelector('#post').onclick = () => {
      const text = s.querySelector('#stxt').value.trim() || 'quiet status';
      db.statuses.unshift({ id: 's'+Date.now(), author: db.session, kind: 'text', text, hue: 1, likes: 0, ago: 'now' });
      db.posts.unshift({ id: 'p'+Date.now(), author: db.session, text, hue: 1, likes: 0, comments: 0, audience: aud });
      state.sheet = null; save(); render();
    };
  }
  const x = s.querySelector('#x'); if (x) x.onclick = () => { state.sheet = null; render(); };
  return s;
}
function feed() {
  const n = document.createElement('div'); n.className = 'screen'; n.style.position = 'relative';
  const tabs = document.createElement('div'); tabs.className = 'ftabs';
  tabs.innerHTML = '<button data-f="foryou">For You</button><button data-f="friends">Friends</button><button data-f="following">Following</button>';
  n.append(tabs);
  tabs.querySelectorAll('button').forEach(b => { if (b.dataset.f === state.feed) b.classList.add('on'); b.onclick = () => { state.feed = b.dataset.f; render(); }; });
  const sc = document.createElement('div'); sc.className = 'feed';
  const user = me(); const following = new Set(user.followingIds || []);
  let posts = db.posts.filter(p => state.feed === 'foryou' ? true : state.feed === 'friends' ? (p.audience === 'friends' || following.has(p.author) || p.author === db.session) : (following.has(p.author) || p.author === db.session || p.audience === 'following'));
  if (!posts.length) posts = db.posts;
  posts.forEach(p => {
    const who = p.author === db.session ? me() : person(p.author);
    const card = document.createElement('article'); card.className = 'cardv';
    card.innerHTML = `<div class="bg" style="background:linear-gradient(160deg, ${hues[p.hue % 6]}, #1a100c 70%)"></div><div class="veil"></div><div class="cap"><div class="tag">@${who.handle || who.name}</div><h2 style="margin:6px 0;font-family:Fraunces,serif">${p.text}</h2><span>24h status energy · ${p.comments} replies</span></div><div class="rail"><button data-act="like">like ${p.likes}</button><button data-act="follow">${following.has(p.author) ? 'following' : 'follow'}</button><button data-act="share">share</button></div>`;
    card.querySelector('[data-act=like]').onclick = () => { p.likes++; save(); render(); };
    card.querySelector('[data-act=follow]').onclick = () => { if (p.author === db.session) return; const set = new Set(user.followingIds); set.has(p.author) ? set.delete(p.author) : set.add(p.author); user.followingIds = [...set]; save(); render(); };
    card.querySelector('[data-act=share]').onclick = () => { db.statuses.unshift({ id: 'r'+Date.now(), author: db.session, kind: 'text', text: 'reshare ' + p.text, hue: p.hue, likes: 0, ago: 'now' }); save(); alert('Reshared to your status'); };
    sc.append(card);
  });
  n.append(sc); return n;
}
function statusView() {
  const n = document.createElement('div'); n.className = 'screen';
  n.innerHTML = '<div class="top"><div><div class="tag">Updates · 24 hours</div><h2>Status</h2></div><button class="iconbtn" id="add">+</button></div><div class="stories" id="stories"></div><div class="list" id="list"></div>';
  n.querySelector('#add').onclick = () => { state.sheet = 'composer'; render(); };
  const stories = n.querySelector('#stories');
  const mine = document.createElement('div'); mine.className = 'story'; mine.innerHTML = '<div class="ava" style="background:#ffc56a">+</div>You';
  mine.onclick = () => { state.sheet = 'composer'; render(); }; stories.append(mine);
  db.statuses.forEach(s => {
    const who = s.author === db.session ? me().name : person(s.author).name;
    const el = document.createElement('div'); el.className = 'story';
    el.innerHTML = `${avatar(who)}<div>${who.split(' ')[0]}</div>`;
    el.querySelector('.ava').classList.add('ring');
    el.onclick = () => viewStatus(s); stories.append(el);
  });
  const list = n.querySelector('#list');
  db.statuses.forEach(s => {
    const who = s.author === db.session ? 'You' : person(s.author).name;
    const row = document.createElement('div'); row.className = 'row';
    row.innerHTML = `${avatar(who)}<div class="meta"><b>${who}${s.channel ? ' · channel status' : ''}</b><span>${s.text}</span></div><span class="time">${s.ago}</span>`;
    list.append(row);
  });
  return n;
}
function viewStatus(s) {
  const who = s.author === db.session ? 'You' : person(s.author).name;
  const overlay = document.createElement('div'); overlay.className = 'thread';
  overlay.innerHTML = `<div class="bg" style="position:absolute;inset:0;background:linear-gradient(180deg, ${hues[s.hue % 6]}, #120e0b)"></div><div class="thead" style="position:relative"><button class="iconbtn" id="back">←</button><b>${who}</b><span class="time">${s.ago} · 24h</span></div><div style="position:relative;padding:28px"><h1 style="font-family:Fraunces,serif">${s.text}</h1><p>${s.likes} likes</p><button class="primary" id="like">Like</button></div>`;
  overlay.querySelector('#back').onclick = () => render();
  overlay.querySelector('#like').onclick = () => { s.likes++; save(); render(); };
  document.getElementById('root').innerHTML = ''; document.getElementById('root').append(overlay);
}
function calls() {
  const n = document.createElement('div'); n.className = 'screen';
  n.innerHTML = '<div class="top"><div><div class="tag">Voice and video · web calling</div><h2>Calls</h2></div></div><div class="list"></div>';
  seedPeople.filter(p => !p.channel).forEach(p => {
    const row = document.createElement('div'); row.className = 'row';
    row.innerHTML = `${avatar(p.name)}<div class="meta"><b>${p.name}</b><span>${p.online ? 'active now' : 'last seen recently'}</span></div><button class="iconbtn" data-v="0">voice</button><button class="iconbtn" data-v="1">video</button>`;
    row.querySelector('[data-v="0"]').onclick = () => { state.call = { peer: p.name, video: false }; render(); };
    row.querySelector('[data-v="1"]').onclick = () => { state.call = { peer: p.name, video: true }; render(); };
    n.querySelector('.list').append(row);
  });
  return n;
}
function callView() {
  const n = document.createElement('section'); n.className = 'screen call';
  n.innerHTML = `${avatar(state.call.peer)}<h2>${state.call.peer}</h2><p>${state.call.video ? 'Video' : 'Voice'} call mock</p><button class="primary" id="end" style="width:auto;padding:14px 28px">End</button>`;
  n.querySelector('#end').onclick = () => { state.call = null; render(); }; return n;
}
function profile() {
  const u = me(); const n = document.createElement('div'); n.className = 'screen profile';
  const following = (u.followingIds || []).length;
  n.innerHTML = `<div class="top"><h2>@${u.handle}</h2><button class="iconbtn" id="out">out</button></div>${avatar(u.name)}<h2 style="margin:8px 0 0">${u.name}</h2><p class="sub">${u.bio}</p><div class="stats"><div><b>${u.followers}</b><div class="time">Followers</div></div><div><b>${following}</b><div class="time">Following</div></div><div><b>${db.statuses.filter(s => s.author === u.username).length}</b><div class="time">Status</div></div></div><div class="pills"><button class="on">Grid</button><button id="edit">Edit bio</button></div><div class="grid" id="grid"></div><h3>Following</h3><div id="fol"></div>`;
  n.querySelector('#out').onclick = () => { db.session = null; save(); render(); };
  n.querySelector('#edit').onclick = () => { const bio = prompt('Bio', u.bio); if (bio != null) { u.bio = bio; save(); render(); } };
  const grid = n.querySelector('#grid');
  db.posts.slice(0, 6).forEach(p => { const t = document.createElement('div'); t.className = 'tile'; t.style.background = `linear-gradient(160deg, ${hues[p.hue % 6]}, #2a1c12)`; grid.append(t); });
  const fol = n.querySelector('#fol');
  seedPeople.filter(p => !p.channel).forEach(p => {
    const on = (u.followingIds || []).includes(p.id);
    const row = document.createElement('div'); row.className = 'row';
    row.innerHTML = `${avatar(p.name,'sm')}<div class="meta"><b>${p.name}</b><span>@${p.handle}</span></div><button class="primary" style="width:auto;margin:0;padding:8px 12px">${on ? 'Following' : 'Follow'}</button>`;
    row.querySelector('button').onclick = () => { const set = new Set(u.followingIds); set.has(p.id) ? set.delete(p.id) : set.add(p.id); u.followingIds = [...set]; save(); render(); };
    fol.append(row);
  });
  return n;
}
render();
