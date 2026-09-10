const C=window.C85;
const state={service:null,barber:null,date:null,time:null,payment:'pix'};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function renderServices(){
  $('#serviceGrid').innerHTML=C.services.map(s=>`<button class="choice" data-service="${s.id}"><strong>${s.name}</strong><small>${s.duration} min</small><span class="price">${C.currency(s.price)}</span></button>`).join('');
  $$('[data-service]').forEach(b=>b.onclick=()=>{state.service=b.dataset.service;select('[data-service]',b);updateSummary();updateButton()});
}
function renderBarbers(){
  $('#barberGrid').innerHTML=C.barbers.map(b=>`<button class="barber-choice" data-barber="${b.id}"><div class="avatar">${b.initials}</div><strong>${b.name}</strong><small>${b.specialty}</small></button>`).join('');
  $$('[data-barber]').forEach(b=>b.onclick=()=>{state.barber=b.dataset.barber;select('[data-barber]',b);renderTimes();updateSummary();updateButton()});
}
function renderDates(){
  const days=[];let d=new Date();
  for(let i=0;i<7;i++){const x=new Date(d);x.setDate(d.getDate()+i); if(x.getDay()!==0) days.push(x)}
  $('#dateGrid').innerHTML=days.slice(0,5).map((d,i)=>`<button class="date-choice" data-date="${C.isoDate(d)}"><span>${i===0?'Hoje':d.toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','')}</span><strong>${d.getDate()}</strong><small>${d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</small></button>`).join('');
  $$('[data-date]').forEach(b=>b.onclick=()=>{state.date=b.dataset.date;state.time=null;select('[data-date]',b);renderTimes();updateSummary();updateButton()});
}
function renderTimes(){
  const bookings=C.getBookings();
  $('#timeGrid').innerHTML=C.times.map(t=>{
    const busy=state.date&&state.barber&&bookings.some(x=>x.date===state.date&&x.time===t&&x.barberId===state.barber&&x.status!=='cancelled');
    return `<button class="time-choice" data-time="${t}" ${busy?'disabled':''}>${t}${busy?'<br><small>ocupado</small>':''}</button>`
  }).join('');
  $$('[data-time]').forEach(b=>b.onclick=()=>{state.time=b.dataset.time;select('[data-time]',b);updateSummary();updateButton()});
}
function renderPayments(){
  $$('[data-payment]').forEach(b=>b.onclick=()=>{state.payment=b.dataset.payment;select('[data-payment]',b);updateSummary();updateButton()});
}
function select(selector,el){$$(selector).forEach(x=>x.classList.remove('selected'));el.classList.add('selected')}
function service(){return C.services.find(x=>x.id===state.service)}
function barber(){return C.barbers.find(x=>x.id===state.barber)}
function paymentLabel(){return {pix:'Pix • sinal de 30%',card:'Cartão • pagamento total',local:'Pagar no local'}[state.payment]}
function payNow(){const s=service(); if(!s)return 0; return state.payment==='pix'?+(s.price*.3).toFixed(2):state.payment==='card'?s.price:0}
function updateSummary(){
  $('#sumService').textContent=service()?.name||'—';$('#sumBarber').textContent=barber()?.name||'—';$('#sumDate').textContent=state.date?C.formatDate(state.date):'—';$('#sumTime').textContent=state.time||'—';$('#sumPrice').textContent=C.currency(service()?.price||0);$('#sumPayment').textContent=paymentLabel();
  const now=payNow(); $('#payNowBox').hidden=now<=0; $('#sumPayNow').textContent=C.currency(now);
}
function updateButton(){const ok=state.service&&state.barber&&state.date&&state.time&&$('#customerName').value.trim().length>=2&&$('#customerPhone').value.trim().length>=8;$('#confirmBtn').disabled=!ok}
function bookingObject(paymentStatus,paidAmount,status){return {id:'b'+Date.now(),date:state.date,time:state.time,customer:$('#customerName').value.trim(),phone:$('#customerPhone').value.trim(),serviceId:state.service,barberId:state.barber,price:service().price,status,paymentMethod:state.payment,paymentStatus,paidAmount,createdAt:Date.now()}}
function saveBooking(paymentStatus,paidAmount,status){const list=C.getBookings();list.push(bookingObject(paymentStatus,paidAmount,status));C.setBookings(list)}
function fakeQr(){const box=$('#fakeQr');box.innerHTML='';let seed=37;for(let i=0;i<225;i++){seed=(seed*73+41)%997;const cell=document.createElement('i');if(seed%3!==0)cell.className='on';box.appendChild(cell)}}
function openPayment(){
  if(state.payment==='local'){saveBooking('local',0,'pending');showSuccess('Horário solicitado. Na versão real, a barbearia receberia a reserva e o pagamento seria feito no estabelecimento.');return}
  $('#paymentModal').hidden=false;$('#pixArea').hidden=state.payment!=='pix';$('#cardArea').hidden=state.payment!=='card';$('#paymentTitle').textContent=state.payment==='pix'?'Sinal via Pix':'Pagamento com cartão';$('#paymentAmount').textContent=C.currency(payNow());
  if(state.payment==='pix')fakeQr();
}
function completePayment(){
  if(state.payment==='card'){
    const num=$('#cardNumber').value.replace(/\D/g,''); if(num.length<12){$('#cardNumber').focus();return}
  }
  const paid=payNow(); saveBooking(state.payment==='pix'?'signal_paid':'paid',paid,'confirmed');$('#paymentModal').hidden=true;showSuccess(state.payment==='pix'?`Sinal de ${C.currency(paid)} aprovado na simulação. O horário ficou confirmado.`:`Pagamento de ${C.currency(paid)} aprovado na simulação. O horário ficou confirmado.`)
}
function showSuccess(text){$('#modalText').textContent=text;$('#modal').hidden=false}

renderServices();renderBarbers();renderDates();renderTimes();renderPayments();updateSummary();
$('#customerName').addEventListener('input',updateButton);$('#customerPhone').addEventListener('input',updateButton);$('#confirmBtn').onclick=openPayment;$('#closePayment').onclick=()=>$('#paymentModal').hidden=true;$('#payDemoBtn').onclick=completePayment;$('#closeModal').onclick=()=>$('#modal').hidden=true;
$('#copyPix').onclick=async()=>{try{await navigator.clipboard.writeText($('#pixCode').textContent);$('#copyPix').textContent='Copiado ✓';setTimeout(()=>$('#copyPix').textContent='Copiar código',1200)}catch{}};
