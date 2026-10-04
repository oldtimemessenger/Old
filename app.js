const KEY = "old-messenger-v2";
const hues = ["#ffb15a", "#ffd9a0", "#f08a5d", "#e8c9a0", "#ff8a1e", "#c9a27a"];
const people = [
  { id: "maya", name: "Maya Chen", handle: "maya", bio: "night markets and voice notes", followers: 12840, online: true, bday: "Oct 9" },
  { id: "leo", name: "Leo Okonkwo", handle: "leo", bio: "communities and Friday events", followers: 902, online: true, bday: "Nov 2" },
  { id: "aria", name: "Aria Sol", handle: "aria", bio: "status poet", followers: 44021, online: false, bday: "Oct 6" },
  { id: "nile", name: "Nile Park", handle: "nile", bio: "calls from the web", followers: 2201, online: true, bday: "Jan 14" },
  { id: "radio", name: "Old Radio", handle: "oldradio", bio: "channel daily drops", followers: 91000, online: false, channel: true }
];
const now = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
function seed() {
  return {
    users: [{ username: "demo", password: "demo123", name: "Demo", handle: "demo", bio: "testing Old", followers: 240, followingIds: ["maya", "aria"] }],
    session: null,
    chats: [
      { id: "c1", title: "Maya Chen", peer: "maya", kind: "dm", pinned: true, muted: false, archived: false, restricted: false, disappearing: false, unread: 2, preview: "send the voice note", time: "2m", messages: [
        { id: "m1", from: "maya", text: "channel status is up for 24h", time: "9:12" },
        { id: "m2", from: "me", text: "saving it to my status", time: "9:14", status: "read" },
        { id: "m3", from: "maya", text: "send the voice note", time: "9:18", reactions: ["fire"] }
      ]},
      { id: "c2", title: "Night Market", kind: "group", tag: "hosts", members: ["leo", "maya", "aria"], archived: false, unread: 0, preview: "Leo: event Friday rooftop", time: "1h", messages: [
        { id: "g1", from: "leo", text: "event reminder Friday rooftop", time: "8:02", reactions: ["party"] }
      ]},
      { id: "c3", title: "Old Radio", peer: "radio", kind: "channel", archived: false, unread: 1, preview: "Channel status is live", time: "3h", messages: [
        { id: "ch1", from: "radio", text: "Channel status is live. Like or reshare to your status.", time: "6:40" }
      ]},
      { id: "c4", title: "Aria Sol", peer: "aria", kind: "dm", restricted: true, archived: false, unread: 0, preview: "restricted chat stays on this device", time: "yday", messages: [
        { id: "a1", from: "aria", text: "this chat stays on this device", time: "22:11" }
      ]}
    ],
    statuses: [
      { id: "s1", author: "maya", text: "amber hour", hue: 0, likes: 42, ago: "2h", audience: "friends" },
      { id: "s2", author: "aria", text: "leave the unread on purpose", hue: 2, likes: 128, ago: "4h", audience: "foryou" },
      { id: "s3", author: "radio", text: "Channel status daily drop", hue: 4, likes: 900, ago: "5h", channel: true, audience: "foryou" }
    ],
    posts: [
      { id: "p1", author: "aria", text: "for you: a thread that disappears like a status", hue: 1, likes: 2301, comments: [{ by: "maya", text: "this should be a status" }], audience: "foryou" },
      { id: "p2", author: "maya", text: "friends only voice-note walk home", hue: 3, likes: 410, comments: [], audience: "friends" },
      { id: "p3", author: "leo", text: "following feed: community event Friday", hue: 0, likes: 96, comments: [], audience: "following" },
      { id: "p4", author: "nile", text: "web calling is in. tap the phone.", hue: 5, likes: 640, comments: [], audience: "foryou" }
    ],
    calls: [{ peer: "Maya Chen", kind: "voice", when: "Today 9:02", missed: false }]
  };
}
let db = JSON.parse(localStorage.getItem(KEY) || "null") || seed();
if (!db.calls) db.calls = [];
const save = () => localStorage.setItem(KEY, JSON.stringify(db));
const me = () => db.users.find(u => u.username === db.session);
const person = id => people.find(p => p.id === id) || { name: id, handle: id };
const state = { tab: "chats", filter: "all", query: "", feed: "foryou", chatId: null, sheet: null, call: null, authMode: "in", reply: null, statusIdx: null, toast: "" };
function avatar(name, size) {
  const hue = hues[(name || "A").charCodeAt(0) % hues.length];
  return `<div class="ava ${size || ""}" style="background:${hue}">${(name || "?").slice(0, 1)}</div>`;
}
function toast(t) { state.toast = t; render(); setTimeout(() => { state.toast = ""; render(); }, 1400); }
function render() {
  const root = document.getElementById("root");
  root.innerHTML = "";
  root.append(db.session ? shell() : auth());
  if (state.toast) root.append(Object.assign(document.createElement("div"), { className: "toast", textContent: state.toast }));
}
function auth() {
  const n = document.createElement("section");
  n.className = "screen auth";
  n.innerHTML = `<div class="mark"><div class="orb"></div> Old · Oct 2026</div><h1>Messages with a pulse.</h1><p class="sub">Chats, channels, 24h status, and a vertical For You.</p>
    <div class="tabs"><button data-m="in" class="${state.authMode === "in" ? "on" : ""}">Sign in</button><button data-m="up" class="${state.authMode === "up" ? "on" : ""}">Create</button></div>
    <label>Username</label><input id="user" placeholder="demo" />
    <label>Display name</label><input id="name" placeholder="Your name" style="${state.authMode === "up" ? "" : "display:none"}" />
    <label>Password</label><input id="pass" type="password" placeholder="demo123" />
    <div class="err" id="err"></div>
    <button class="primary" id="go">${state.authMode === "in" ? "Enter Old" : "Create username"}</button>
    <button class="social" disabled>Continue with Google · disabled for testing</button>
    <button class="social" disabled>Continue with Apple · disabled for testing</button>
    <p class="muted">Seed login demo / demo123. Accounts stay on this device.</p>`;
  n.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { state.authMode = b.dataset.m; render(); });
  n.querySelector("#go").onclick = () => {
    const username = n.querySelector("#user").value.trim().toLowerCase();
    const password = n.querySelector("#pass").value;
    const err = n.querySelector("#err");
    if (!/^[a-z0-9_]{3,16}$/.test(username) || password.length < 4) { err.textContent = "Username 3-16 letters or numbers, password 4+."; return; }
    if (state.authMode === "up") {
      if (db.users.some(u => u.username === username)) { err.textContent = "Username taken."; return; }
      db.users.push({ username, password, name: n.querySelector("#name").value.trim() || username, handle: username, bio: "new on Old", followers: 0, followingIds: [] });
    } else if (!db.users.some(u => u.username === username && u.password === password)) { err.textContent = "No match. Try demo / demo123."; return; }
    db.session = username; save(); render();
  };
  return n;
}
function shell() {
  const n = document.createElement("section");
  n.className = "screen";
  if (state.call) { n.append(callView()); return n; }
  if (state.statusIdx != null) { n.append(statusPlayer()); return n; }
  if (state.chatId) { n.append(thread()); return n; }
  if (state.tab === "chats") n.append(chats());
  if (state.tab === "feed") n.append(feed());
  if (state.tab === "status") n.append(statusView());
  if (state.tab === "calls") n.append(calls());
  if (state.tab === "profile") n.append(profile());
  n.append(dock());
  if (state.sheet) n.append(sheet());
  return n;
}
function dock() {
  const d = document.createElement("nav");
  d.className = "dock";
  [["chats", "Chats"], ["feed", "For You"], ["status", "Status"], ["calls", "Calls"], ["profile", "You"]].forEach(([id, label]) => {
    const b = document.createElement("button");
    b.textContent = label;
    if (state.tab === id) b.className = "on";
    b.onclick = () => { state.tab = id; state.sheet = null; render(); };
    d.append(b);
  });
  return d;
}
function chats() {
  const n = document.createElement("div");
  n.className = "screen";
  const filters = ["all", "unread", "channels", "groups", "archived"];
  n.innerHTML = `<div class="top"><div><div class="tag">Chats · channels inside</div><h2>Old</h2></div><button class="iconbtn" id="new">+</button></div>
    <input class="search" id="q" placeholder="Search chats and contacts" value="${state.query}" />
    <div class="pills">${filters.map(f => `<button data-f="${f}" class="${state.filter === f ? "on" : ""}">${f}</button>`).join("")}</div>
    <div class="list" id="list"></div>`;
  n.querySelector("#q").oninput = e => { state.query = e.target.value.toLowerCase(); render(); };
  n.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { state.filter = b.dataset.f; render(); });
  n.querySelector("#new").onclick = () => { state.sheet = "new"; render(); };
  const list = n.querySelector("#list");
  let items = db.chats.filter(c => state.filter === "archived" ? c.archived : !c.archived);
  if (state.filter === "unread") items = items.filter(c => c.unread);
  if (state.filter === "channels") items = items.filter(c => c.kind === "channel");
  if (state.filter === "groups") items = items.filter(c => c.kind === "group");
  if (state.query) items = items.filter(c => (c.title + c.preview).toLowerCase().includes(state.query));
  items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  items.forEach(c => {
    const row = document.createElement("button");
    row.className = "row";
    row.innerHTML = `${avatar(c.title)}<div class="meta"><b>${c.pinned ? "pin · " : ""}${c.title}${c.restricted ? " · restricted" : ""}${c.kind === "channel" ? " · channel" : ""}${c.muted ? " · muted" : ""}</b><span class="clip">${c.preview}</span></div><div><div class="time">${c.time}</div>${c.unread ? `<div class="badge">${c.unread}</div>` : ""}</div>`;
    row.onclick = () => { c.unread = 0; state.chatId = c.id; state.reply = null; save(); render(); };
    list.append(row);
  });
  if (!items.length) list.insertAdjacentHTML("beforeend", `<p class="muted" style="padding:12px">Nothing in ${state.filter}.</p>`);
  list.insertAdjacentHTML("beforeend", `<div class="tag" style="padding:10px 8px">Contacts · active now</div>`);
  people.filter(p => !p.channel && (!state.query || p.name.toLowerCase().includes(state.query))).forEach(p => {
    const row = document.createElement("button");
    row.className = "row";
    row.innerHTML = `${avatar(p.name)}<div class="meta"><b>${p.name}</b><span>${p.online ? "active now" : "last seen recently"}${p.bday.startsWith("Oct") ? " · birthday " + p.bday : ""}</span></div>`;
    row.onclick = () => openDm(p);
    list.append(row);
  });
  return n;
}
function openDm(p) {
  let c = db.chats.find(x => x.peer === p.id && x.kind === "dm");
  if (!c) {
    c = { id: "c" + Date.now(), title: p.name, peer: p.id, kind: "dm", archived: false, unread: 0, preview: "say hi", time: "now", messages: [] };
    db.chats.unshift(c);
  }
  c.archived = false;
  state.chatId = c.id;
  save();
  render();
}
function thread() {
  const c = db.chats.find(x => x.id === state.chatId);
  const n = document.createElement("section");
  n.className = "thread";
  n.innerHTML = `<div class="thead"><button class="iconbtn" id="back">←</button>${avatar(c.title, "sm")}<div class="meta"><b>${c.title}</b><span class="clip">${c.kind === "channel" ? "channel in chats" : c.kind === "group" ? (c.members || []).length + " members · tag " + (c.tag || "members") : c.restricted ? "restricted · not on linked devices" : "online"}</span></div><button class="iconbtn" id="call">call</button><button class="iconbtn" id="more">⋯</button></div><div class="msgs" id="msgs"></div><div id="replybar"></div><div class="composer"><button id="mic">voice</button><textarea id="box" rows="1" placeholder="${c.kind === "channel" ? "Channels are broadcast" : "Message"}"></textarea><button id="send">Send</button></div>`;
  n.querySelector("#back").onclick = () => { state.chatId = null; render(); };
  n.querySelector("#more").onclick = () => { state.sheet = "chat"; render(); };
  n.querySelector("#call").onclick = () => startCall(c.title, false);
  if (state.reply) n.querySelector("#replybar").innerHTML = `<div class="reply" style="margin:6px 10px">Replying to ${state.reply} <button id="clear" style="border:0;background:none;color:#ffc56a">cancel</button></div>`;
  const clear = n.querySelector("#clear");
  if (clear) clear.onclick = () => { state.reply = null; render(); };
  const box = n.querySelector("#msgs");
  c.messages.forEach(m => {
    const b = document.createElement("div");
    b.className = "bubble" + (m.from === "me" ? " me" : "");
    const who = m.from === "me" ? "" : `<b>${m.from}</b><br>`;
    b.innerHTML = `${m.replyTo ? `<div class="reply">${m.replyTo}</div>` : ""}${who}${m.voice ? wave() : m.photo ? `<div class="tile" style="width:180px;background:linear-gradient(160deg,#ffb15a,#2a1c12)"></div><div>${m.text}</div>` : m.text}${m.star ? " star" : ""}<small>${m.time}${m.from === "me" ? " · " + (m.status || "sent") : ""}</small>${m.reactions ? `<div>${m.reactions.join(" ")}</div>` : ""}`;
    b.onclick = () => { state.sheet = "msg:" + m.id; render(); };
    box.append(b);
  });
  box.scrollTop = box.scrollHeight;
  n.querySelector("#send").onclick = () => send(c, n.querySelector("#box").value);
  n.querySelector("#box").onkeydown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(c, e.target.value); } };
  n.querySelector("#mic").onclick = () => {
    if (c.kind === "channel") return;
    c.messages.push({ id: "v" + Date.now(), from: "me", voice: true, text: "voice note", time: now(), status: "delivered" });
    c.preview = "Voice note"; c.time = "now"; save(); render();
  };
  return n;
}
function wave() { return `<div class="wave">${Array.from({ length: 14 }, (_, i) => `<i style="height:${8 + (i * 13) % 22}px"></i>`).join("")}</div>`; }
function send(c, text) {
  text = (text || "").trim();
  if (!text || c.kind === "channel") return;
  c.messages.push({ id: "x" + Date.now(), from: "me", text, time: now(), status: "sent", replyTo: state.reply || "" });
  state.reply = null;
  c.preview = text; c.time = "now";
  save(); render();
  setTimeout(() => {
    const msg = c.messages[c.messages.length - 1];
    if (msg && msg.from === "me") msg.status = "read";
    if (c.kind !== "channel") c.messages.push({ id: "r" + Date.now(), from: c.peer || "leo", text: "got it", time: now() });
    c.preview = "got it"; save();
    if (state.chatId === c.id) render();
  }, 600);
}
function sheet() {
  const s = document.createElement("div");
  s.className = "sheet";
  const close = () => { state.sheet = null; render(); };
  if (state.sheet === "new") {
    s.innerHTML = `<b>New</b><button id="dm">Message a contact</button><button id="grp">New community</button><button id="st">Threads-style status</button><button id="photo">Photo message to Maya</button><button id="x">Close</button>`;
    s.querySelector("#dm").onclick = () => { state.sheet = "pick"; render(); };
    s.querySelector("#grp").onclick = () => { db.chats.unshift({ id: "g" + Date.now(), title: "New community", kind: "group", tag: "members", members: ["leo"], archived: false, unread: 0, preview: "you created this", time: "now", messages: [{ id: "n1", from: "me", text: "community is open", time: now(), status: "sent" }] }); state.sheet = null; save(); render(); };
    s.querySelector("#st").onclick = () => { state.sheet = "composer"; state.tab = "status"; render(); };
    s.querySelector("#photo").onclick = () => { const c = db.chats.find(x => x.id === "c1"); c.messages.push({ id: "ph" + Date.now(), from: "me", photo: true, text: "amber hour", time: now(), status: "sent" }); state.chatId = "c1"; state.sheet = null; save(); render(); };
  } else if (state.sheet === "pick") {
    s.innerHTML = `<b>Contacts</b>` + people.filter(p => !p.channel).map(p => `<button data-id="${p.id}">${p.name}</button>`).join("") + `<button id="x">Close</button>`;
    s.querySelectorAll("[data-id]").forEach(b => b.onclick = () => { state.sheet = null; openDm(person(b.dataset.id)); });
  } else if (state.sheet === "chat") {
    const c = db.chats.find(x => x.id === state.chatId);
    s.innerHTML = `<b>${c.title}</b><button id="pin">${c.pinned ? "Unpin" : "Pin"}</button><button id="mute">${c.muted ? "Unmute" : "Mute"}</button><button id="arch">${c.archived ? "Unarchive" : "Archive"}</button><button id="dis">${c.disappearing ? "Disappearing on" : "Disappearing messages"}</button><button id="res">${c.restricted ? "Restricted" : "Restrict chat"}</button><button id="info">Chat info</button><button id="x">Close</button>`;
    s.querySelector("#pin").onclick = () => { c.pinned = !c.pinned; close(); save(); };
    s.querySelector("#mute").onclick = () => { c.muted = !c.muted; close(); save(); };
    s.querySelector("#arch").onclick = () => { c.archived = !c.archived; state.chatId = null; close(); save(); };
    s.querySelector("#dis").onclick = () => { c.disappearing = !c.disappearing; close(); save(); };
    s.querySelector("#res").onclick = () => { c.restricted = !c.restricted; close(); save(); };
    s.querySelector("#info").onclick = () => { state.sheet = "info"; render(); };
  } else if (state.sheet === "info") {
    const c = db.chats.find(x => x.id === state.chatId);
    const members = (c.members || [c.peer]).filter(Boolean).map(id => person(id).name).join(", ") || "just you";
    s.innerHTML = `<b>${c.title}</b><p class="muted">${c.kind} · ${c.disappearing ? "disappearing" : "kept"} · ${members}</p><p class="muted">${c.messages.filter(m => m.star).length} starred</p><button id="x">Close</button>`;
  } else if (String(state.sheet).startsWith("msg:")) {
    const c = db.chats.find(x => x.id === state.chatId);
    const m = c.messages.find(x => x.id === state.sheet.slice(4));
    s.innerHTML = `<b>Message</b><button data-e="heart">React heart</button><button data-e="fire">React fire</button><button data-e="star">React star</button><button id="reply">Reply</button><button id="star">${m.star ? "Unstar" : "Star"}</button><button id="del">Delete</button><button id="x">Close</button>`;
    s.querySelectorAll("[data-e]").forEach(b => b.onclick = () => { m.reactions = [b.dataset.e]; close(); save(); });
    s.querySelector("#reply").onclick = () => { state.reply = m.text; state.sheet = null; render(); };
    s.querySelector("#star").onclick = () => { m.star = !m.star; close(); save(); };
    s.querySelector("#del").onclick = () => { c.messages = c.messages.filter(x => x.id !== m.id); close(); save(); };
  } else if (state.sheet === "composer") {
    s.innerHTML = `<b>Status · Threads style</b><textarea id="stxt" rows="3" placeholder="What is happening for 24 hours?"></textarea><div class="pills"><button data-a="foryou" class="on">For you</button><button data-a="friends">Friends</button><button data-a="following">Following</button></div><button class="primary" id="post">Post 24h status</button><button id="x">Close</button>`;
    let aud = "foryou";
    s.querySelectorAll("[data-a]").forEach(b => b.onclick = () => { aud = b.dataset.a; s.querySelectorAll("[data-a]").forEach(x => x.classList.remove("on")); b.classList.add("on"); });
    s.querySelector("#post").onclick = () => {
      const text = s.querySelector("#stxt").value.trim() || "quiet status";
      db.statuses.unshift({ id: "s" + Date.now(), author: db.session, text, hue: 1, likes: 0, ago: "now", audience: aud });
      db.posts.unshift({ id: "p" + Date.now(), author: db.session, text, hue: 1, likes: 0, comments: [], audience: aud });
      state.sheet = null; save(); toast("Status live for 24h");
    };
  } else if (String(state.sheet).startsWith("comments:")) {
    const p = db.posts.find(x => x.id === state.sheet.slice(9));
    s.innerHTML = `<b>Replies</b>` + (p.comments.map(c => `<p>${c.by}: ${c.text}</p>`).join("") || `<p class="muted">No replies yet.</p>`) + `<input id="ct" placeholder="Reply" /><button class="primary" id="add">Reply</button><button id="x">Close</button>`;
    s.querySelector("#add").onclick = () => { const t = s.querySelector("#ct").value.trim(); if (!t) return; p.comments.push({ by: db.session, text: t }); save(); render(); };
  }
  const x = s.querySelector("#x");
  if (x) x.onclick = close;
  return s;
}
function feed() {
  const n = document.createElement("div");
  n.className = "screen";
  n.style.position = "relative";
  n.innerHTML = `<div class="ftabs"><button data-f="foryou">For You</button><button data-f="friends">Friends</button><button data-f="following">Following</button></div><div class="feed" id="sc"></div>`;
  n.querySelectorAll("[data-f]").forEach(b => { if (b.dataset.f === state.feed) b.classList.add("on"); b.onclick = () => { state.feed = b.dataset.f; render(); }; });
  const user = me();
  const following = new Set(user.followingIds || []);
  let posts = db.posts.filter(p => state.feed === "foryou" || (state.feed === "friends" ? p.audience !== "foryou" || following.has(p.author) || p.author === db.session : following.has(p.author) || p.author === db.session));
  if (!posts.length) posts = db.posts;
  const sc = n.querySelector("#sc");
  posts.forEach(p => {
    const who = p.author === db.session ? me() : person(p.author);
    const card = document.createElement("article");
    card.className = "cardv";
    card.innerHTML = `<div style="position:absolute;inset:0;background:linear-gradient(165deg,${hues[p.hue % 6]},#140e0b 72%)"></div><div class="veil"></div><div class="cap"><div class="tag">@${who.handle || who.name} · ${p.audience}</div><h2 style="font-family:Fraunces,serif;margin:6px 0">${p.text}</h2><span>${p.comments.length} replies</span></div><div class="rail"><button data-act="like">like ${p.likes}</button><button data-act="comment">reply</button><button data-act="follow">${following.has(p.author) ? "ok" : "+"}</button><button data-act="share">share</button></div>`;
    card.querySelector("[data-act=like]").onclick = () => { p.likes++; save(); render(); };
    card.querySelector("[data-act=comment]").onclick = () => { state.sheet = "comments:" + p.id; render(); };
    card.querySelector("[data-act=follow]").onclick = () => { if (p.author === db.session) return; const set = new Set(user.followingIds); set.has(p.author) ? set.delete(p.author) : set.add(p.author); user.followingIds = [...set]; save(); render(); };
    card.querySelector("[data-act=share]").onclick = () => { db.statuses.unshift({ id: "r" + Date.now(), author: db.session, text: "reshare · " + p.text, hue: p.hue, likes: 0, ago: "now", audience: "friends" }); save(); toast("Reshared to status"); };
    sc.append(card);
  });
  return n;
}
function statusView() {
  const n = document.createElement("div");
  n.className = "screen";
  n.innerHTML = `<div class="top"><div><div class="tag">Updates · 24 hours</div><h2>Status</h2></div><button class="iconbtn" id="add">+</button></div><div class="stories" id="stories"></div><div class="list" id="list"></div>`;
  n.querySelector("#add").onclick = () => { state.sheet = "composer"; render(); };
  const stories = n.querySelector("#stories");
  const mine = document.createElement("button");
  mine.className = "story";
  mine.innerHTML = `<div class="ava" style="background:#ffc56a">+</div>You`;
  mine.onclick = () => { state.sheet = "composer"; render(); };
  stories.append(mine);
  db.statuses.forEach((s, i) => {
    const who = s.author === db.session ? me().name : person(s.author).name;
    const el = document.createElement("button");
    el.className = "story";
    el.innerHTML = `${avatar(who)}<div>${who.split(" ")[0]}</div>`;
    el.querySelector(".ava").classList.add("ring");
    el.onclick = () => { state.statusIdx = i; render(); };
    stories.append(el);
  });
  db.statuses.forEach((s, i) => {
    const who = s.author === db.session ? "You" : person(s.author).name;
    const row = document.createElement("button");
    row.className = "row";
    row.innerHTML = `${avatar(who)}<div class="meta"><b>${who}${s.channel ? " · channel status" : ""}</b><span class="clip">${s.text}</span></div><span class="time">${s.ago}</span>`;
    row.onclick = () => { state.statusIdx = i; render(); };
    n.querySelector("#list").append(row);
  });
  return n;
}
function statusPlayer() {
  const s = db.statuses[state.statusIdx];
  const who = s.author === db.session ? "You" : person(s.author).name;
  const n = document.createElement("section");
  n.className = "thread";
  n.innerHTML = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,${hues[s.hue % 6]},#120e0b)"></div><div class="thead" style="position:relative"><button class="iconbtn" id="back">←</button><b>${who}</b><span class="time">${s.ago} · 24h · ${s.audience || "status"}</span></div><div style="position:relative;padding:24px"><h1 style="font-family:Fraunces,serif">${s.text}</h1><p>${s.likes} likes</p><button class="primary" id="like">Like</button><button class="primary" id="next">Next</button></div>`;
  n.querySelector("#back").onclick = () => { state.statusIdx = null; render(); };
  n.querySelector("#like").onclick = () => { s.likes++; save(); render(); };
  n.querySelector("#next").onclick = () => { state.statusIdx = state.statusIdx + 1 < db.statuses.length ? state.statusIdx + 1 : null; render(); };
  return n;
}
function startCall(peer, video) {
  state.call = { peer, video, sec: 0 };
  db.calls.unshift({ peer, kind: video ? "video" : "voice", when: "Just now", missed: false });
  save();
  render();
  state._timer = setInterval(() => { if (!state.call) return; state.call.sec++; const el = document.getElementById("timer"); if (el) el.textContent = state.call.sec + "s"; }, 1000);
}
function calls() {
  const n = document.createElement("div");
  n.className = "screen";
  n.innerHTML = `<div class="top"><div><div class="tag">Voice and video · web calling</div><h2>Calls</h2></div></div><div class="list" id="list"></div>`;
  const list = n.querySelector("#list");
  db.calls.forEach(c => list.insertAdjacentHTML("beforeend", `<div class="row"><div class="meta"><b>${c.peer}</b><span>${c.kind} · ${c.when}</span></div></div>`));
  people.filter(p => !p.channel).forEach(p => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `${avatar(p.name)}<div class="meta"><b>${p.name}</b><span>${p.online ? "active now" : "last seen recently"}</span></div><button class="iconbtn" data-v="0">voice</button><button class="iconbtn" data-v="1">video</button>`;
    row.querySelector("[data-v='0']").onclick = () => startCall(p.name, false);
    row.querySelector("[data-v='1']").onclick = () => startCall(p.name, true);
    list.append(row);
  });
  return n;
}
function callView() {
  const n = document.createElement("section");
  n.className = "screen call";
  n.innerHTML = `${avatar(state.call.peer)}<h2>${state.call.peer}</h2><p>${state.call.video ? "Video" : "Voice"} · <span id="timer">${state.call.sec}s</span></p><button class="primary" id="end" style="width:auto;padding:14px 28px">End</button>`;
  n.querySelector("#end").onclick = () => { clearInterval(state._timer); state.call = null; render(); };
  return n;
}
function profile() {
  const u = me();
  const n = document.createElement("div");
  n.className = "screen profile";
  n.innerHTML = `<div class="top"><h2>@${u.handle}</h2><button class="iconbtn" id="out">out</button></div>${avatar(u.name)}<h2 style="margin:8px 0 0">${u.name}</h2><p class="sub" id="bio">${u.bio}</p>
    <div class="stats"><div><b>${u.followers}</b><div class="time">Followers</div></div><div><b>${(u.followingIds || []).length}</b><div class="time">Following</div></div><div><b>${db.statuses.filter(s => s.author === u.username).length}</b><div class="time">Status</div></div></div>
    <div class="pills"><button id="edit">Edit bio</button><button id="reset">Reset demo</button></div><div class="grid" id="grid"></div><h3>Following</h3><div id="fol"></div>`;
  n.querySelector("#out").onclick = () => { db.session = null; save(); render(); };
  n.querySelector("#edit").onclick = () => { const bio = prompt("Bio", u.bio); if (bio != null) { u.bio = bio; save(); render(); } };
  n.querySelector("#reset").onclick = () => { localStorage.removeItem(KEY); db = seed(); render(); };
  const grid = n.querySelector("#grid");
  db.posts.filter(p => p.author === u.username).forEach(p => {
    const t = document.createElement("button");
    t.className = "tile";
    t.style.background = `linear-gradient(160deg, ${hues[p.hue % 6]}, #2a1c12)`;
    t.onclick = () => { state.tab = "feed"; render(); };
    grid.append(t);
  });
  if (!grid.children.length) grid.insertAdjacentHTML("beforeend", `<p class="muted">Post a status and it lands here.</p>`);
  people.filter(p => !p.channel).forEach(p => {
    const on = (u.followingIds || []).includes(p.id);
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `${avatar(p.name, "sm")}<div class="meta"><b>${p.name}</b><span>@${p.handle} · ${p.followers} followers</span></div><button class="primary" style="width:auto;margin:0;padding:8px 12px">${on ? "Following" : "Follow"}</button>`;
    row.querySelector("button").onclick = () => { const set = new Set(u.followingIds); set.has(p.id) ? set.delete(p.id) : set.add(p.id); u.followingIds = [...set]; save(); render(); };
    n.querySelector("#fol").append(row);
  });
  return n;
}
render();
