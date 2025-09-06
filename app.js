// app.js
const $ = sel => document.querySelector(sel);

// Formatowanie daty po polsku
const fmt = d => {
const s = d.toLocaleDateString('pl-PL', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
return s.charAt(0).toUpperCase() + s.slice(1);
};

let currentDate = new Date();
let favorites = JSON.parse(localStorage.getItem('aqc_favorites') || "[]");
let notes = JSON.parse(localStorage.getItem('aqc_notes') || "{}");

// Funkcja wybierająca cytat
function pickQuoteFor(date){
const list = Array.isArray(window.QUOTES) ? window.QUOTES : [];
if (!list.length) return null;

const isoLocal = new Date(date.getTime() - date.getTimezoneOffset()*60000).toISOString();
const mmdd = isoLocal.slice(5, 10);

const hinted = list.filter(q => q.date_hint === mmdd);
if (hinted.length) return hinted[0];

const start = new Date(date.getFullYear(), 0, 0);
const dayOfYear = Math.floor((date - start) / (1000*60*60*24));
return list[dayOfYear % list.length];
}

// Renderowanie widoku
function render(){
$("#dateLabel").textContent = fmt(currentDate);
const q = pickQuoteFor(currentDate);

if (!q){
$("#quoteTxt").textContent = "Brak cytatów.";
$("#authorTxt").textContent = "";
$("#contextTxt").textContent = "";
$("#tags").innerHTML = "";
return;
}

$("#card").dataset.qid = q.id || "";
$("#quoteTxt").textContent = `„${q.quote}”`;
$("#authorTxt").textContent = `${q.author}${q.year_or_age ? " — " + q.year_or_age : ""}`;
$("#contextTxt").textContent = q.context || "";
$("#tags").innerHTML = (q.tags || []).map(t => `<span class="tag">#${t}</span>`).join("");
$("#favBtn").classList.toggle("active", favorites.includes(q.id));
}

// Nawigacja dat
$("#prevBtn").onclick = ()=>{ currentDate.setDate(currentDate.getDate()-1); render(); };
$("#nextBtn").onclick = ()=>{ currentDate.setDate(currentDate.getDate()+1); render(); };
$("#todayBtn").onclick = ()=>{ currentDate = new Date(); render(); };

// Losowy cytat
$("#randomBtn").onclick = ()=>{
const i = Math.floor(Math.random() * window.QUOTES.length);
$("#card").style.opacity = .6;
setTimeout(()=>{
const q = window.QUOTES[i];
$("#card").dataset.qid = q.id;
$("#quoteTxt").textContent = `„${q.quote}”`;
$("#authorTxt").textContent = `${q.author}${q.year_or_age ? " — " + q.year_or_age : ""}`;
$("#contextTxt").textContent = q.context || "";
$("#tags").innerHTML = (q.tags || []).map(t => `<span class="tag">#${t}</span>`).join("");
$("#card").style.opacity = 1;
},150);
};

// Obsługa ulubionych
$("#favBtn").onclick = ()=>{
const id = $("#card").dataset.qid;
const i = favorites.indexOf(id);
if(i>=0) favorites.splice(i,1); else favorites.push(id);
localStorage.setItem('aqc_favorites', JSON.stringify(favorites));
$("#favBtn").classList.toggle("active", i<0);
};

// Notatka dnia
const noteDlg = $("#noteDlg");
$("#noteBtn").onclick = ()=>{
const key = new Date(currentDate.getTime()-currentDate.getTimezoneOffset()*60000).toISOString().slice(0,10);
$("#noteArea").value = notes[key] || "";
noteDlg.showModal();

$("#saveNoteBtn").onclick = ()=>{
notes[key] = $("#noteArea").value;
localStorage.setItem('aqc_notes', JSON.stringify(notes));
};
};

render();