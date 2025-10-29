// Fake realistic live transaction stream (truncated signatures, no external links)
// Populates initial 10 rows and then adds 1-2 rows every 1-2 seconds.
// Tracks "Total routed" starting at ~0.35 SOL and slowly increases.

const tbody = document.getElementById('tbody');
const totalSolEl = document.getElementById('totalSol');
const totalUsdEl = document.getElementById('totalUsd');

const SOL_PRICE = 199.1; // example USD price for SOL
let totalSol = 0.35; // starting throughput shown

function fmtSol(v){ return Number(v).toFixed(6); }
function fmtUsd(sol){ return '$' + (sol * SOL_PRICE).toFixed(5); }
function timeAgoLabel(ts){
  const s = Math.floor((Date.now()/1000) - ts);
  if(s < 60) return s + ' secs ago';
  const m = Math.floor(s/60);
  if(m < 60) return m + ' mins ago';
  return Math.floor(m/60) + ' hrs ago';
}

// Random helpers (base58-like charset)
const ALPH = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function randSig(len=88){
  let s='';
  for(let i=0;i<len;i++) s += ALPH[Math.floor(Math.random()*ALPH.length)];
  return s;
}
function shortSig(sig){
  // strongly truncate: show first 4 and last 3 characters
  if(!sig) return '';
  return sig.slice(0,4) + '…' + sig.slice(-3);
}
function randAddr(){
  const s = randSig(44);
  return s.slice(0,6) + '...' + s.slice(-4);
}

// Generate a realistic tiny SOL amount between min and max
function randAmount(){
  const r = Math.random();
  if(r < 0.6) return (Math.random() * (0.00001 - 0.000001) + 0.000001);
  if(r < 0.9) return (Math.random() * (0.0002 - 0.00001) + 0.00001);
  return (Math.random() * (0.001 - 0.0002) + 0.0002);
}

function makeRowObj(){
  const sig = randSig();
  const ts = Math.floor(Date.now()/1000) - Math.floor(Math.random()*8);
  const amount = randAmount();
  return {
    sig,
    sigShort: shortSig(sig),
    time: ts,
    action: 'TRANSFER',
    from: randAddr(),
    to: 'Jitotip 6',
    amount,
    value: amount * SOL_PRICE,
    token: 'SOL'
  };
}

function renderRow(obj){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;">${obj.sigShort}</td>
    <td>${timeAgoLabel(obj.time)}</td>
    <td>${obj.action}</td>
    <td>${obj.from}</td>
    <td>${obj.to}</td>
    <td>+${fmtSol(obj.amount)}</td>
    <td>${fmtUsd(obj.amount)}</td>
    <td>◎ ${obj.token}</td>
  `;
  tbody.prepend(tr);
  while(tbody.children.length > 300) tbody.lastChild.remove();
}

// Initialize with 10 rows (recent)
for(let i=0;i<10;i++){
  const row = makeRowObj();
  renderRow(row);
  totalSol += row.amount;
}

// Update throughput UI
function updateTotals(){
  totalSolEl.textContent = fmtSol(totalSol);
  totalUsdEl.textContent = fmtUsd(totalSol);
}
updateTotals();

// Periodically add 1-2 new fake txs every ~1.2s
setInterval(()=>{
  const count = Math.random() < 0.6 ? 1 : 2;
  for(let i=0;i<count;i++){
    const r = makeRowObj();
    r.time = Math.floor(Date.now()/1000) - Math.floor(Math.random()*2);
    renderRow(r);
    // slowly increase total
    totalSol += r.amount;
  }
  updateTotals();
}, 1200);

// Micro drift occasionally
setInterval(()=>{
  if(Math.random() < 0.12){
    const micro = 0.0000005 + Math.random()*0.0000009;
    totalSol += micro;
    updateTotals();
  }
}, 5000);