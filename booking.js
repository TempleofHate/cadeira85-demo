Cadeira85.getBookings();
const state = { service:null, barber:null, date:null, time:null };
const $ = id => document.getElementById(id);
const prettyDate = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'long'});
const dayLabel = date => date.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','');

function button(html, className, handler, disabled=false){ const el=document.createElement('button'); el.className=className; el.innerHTML=html; el.disabled=disabled; if(disabled)el.classList.add('busy'); el.addEventListener('click',handler); return el; }
function activate(root, el){ [...root.children].forEach(c=>c.classList.remove('active')); el.classList.add('active'); }

function renderServices(){ const root=$('serviceGrid'); Cadeira85.services.forEach(s=>{ const el=button(`<strong>${s.name}</strong><small>${s.description} • ${s.duration} min</small><div class="price">${Cadeira85.money(s.price)}</div>`,'choice',()=>{state.service=s;activate(root,el);update();}); root.append(el); }); }
function renderBarbers(){ const root=$('barberGrid'); Cadeira85.barbers.forEach(b=>{ const el=button(`<div class="avatar">${b.initials}</div><strong>${b.name}</strong><small>${b.specialty}</small>`,'choice barber',()=>{state.barber=b;state.time=null;activate(root,el);renderTimes();update();}); root.append(el); }); }
function renderDates(){ const root=$('dateGrid'); for(let i=0;i<6;i++){const d=Cadeira85.addDays(i);const iso=Cadeira85.isoDate(d);const label=i===0?'Hoje':dayLabel(d);const el=button(`<small>${label}</small><strong>${d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</strong>`,'choice date-choice',()=>{state.date=iso;state.time=null;activate(root,el);renderTimes();update();});root.append(el);} }
function isOccupied(time){ if(!state.barber||!state.date)return false; return Cadeira85.getBookings().some(b=>b.barberId===state.barber.id&&b.date===state.date&&b.time===time&&b.status!=='cancelado'); }
function renderTimes(){ const root=$('timeGrid');root.innerHTML='';Cadeira85.slots.forEach(t=>{const busy=isOccupied(t);const el=button(t,'choice time-choice',()=>{state.time=t;activate(root,el);update();},busy);root.append(el);}); }
function update(){ $('sumService').textContent=state.service?.name||'—';$('sumBarber').textContent=state.barber?.name||'—';$('sumDate').textContent=state.date?prettyDate(state.date):'—';$('sumTime').textContent=state.time||'—';$('sumPrice').textContent=state.service?Cadeira85.money(state.service.price):'R$ 0,00'; const hasData=$('customerName').value.trim().length>=2&&$('customerPhone').value.trim().length>=8; $('confirmBtn').disabled=!(state.service&&state.barber&&state.date&&state.time&&hasData); }
['customerName','customerPhone'].forEach(id=>$(id).addEventListener('input',update));
$('confirmBtn').addEventListener('click',()=>{ if(isOccupied(state.time)){alert('Esse horário acabou de ficar indisponível. Escolha outro.');renderTimes();state.time=null;update();return;} const booking=Cadeira85.addBooking({customer:$('customerName').value.trim(),phone:$('customerPhone').value.trim(),serviceId:state.service.id,barberId:state.barber.id,date:state.date,time:state.time,status:'pendente'}); $('modalText').textContent=`${booking.customer}, reservamos ${state.service.name} com ${state.barber.name}, dia ${prettyDate(state.date)} às ${state.time}. Na demo, a reserva já apareceu no painel.`;$('modal').hidden=false; });
$('closeModal').addEventListener('click',()=>{$('modal').hidden=true;});$('modal').addEventListener('click',e=>{if(e.target.id==='modal')$('modal').hidden=true;});
renderServices();renderBarbers();renderDates();renderTimes();update();
