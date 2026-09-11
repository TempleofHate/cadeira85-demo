import { config, serviceById, barberById } from './config.js';
import { $, money, dateLabel, parseDate, nextDates, dateKey, escapeHTML as e, paymentLabels, paymentStatuses, toast, showError, commonSetup } from './utils.js';
import { getBookings, slotReason, createBooking } from './storage.js';
const steps=[['Serviço','O que vamos fazer hoje?','Escolha o cuidado que combina com você.'],['Profissional','Com quem você quer marcar?','Três profissionais, o mesmo cuidado.'],['Data','Qual dia fica melhor?','Agenda dos próximos 14 dias. Aos domingos, descansamos.'],['Horário','Encontre seu melhor horário.','Horários reservados ou sobrepostos ficam indisponíveis.'],['Seus dados','Como podemos chamar você?','Use dados fictícios para experimentar esta demonstração.'],['Pagamento','Como prefere pagar?','Confira sua reserva e escolha a forma de pagamento.']];
const state={serviceId:null,barberId:null,date:null,time:null,paymentMethod:'pix'};
let step=0,customer={name:'',phone:''},saving=false,finished=false;
const paidNow=()=>state.paymentMethod==='pix'?Math.round((serviceById(state.serviceId)?.price||0)*30)/100:state.paymentMethod==='card'?(serviceById(state.serviceId)?.price||0):0;
function rows(items){return '<dl class="summary-rows">'+items.map(([label,value,cls=''])=>`<div class="${cls}"><dt>${label}</dt><dd>${e(value)}</dd></div>`).join('')+'</dl>';}
function summary(){
  const s=serviceById(state.serviceId),b=barberById(state.barberId);
  $('#summaryCompact').textContent=s?`${s.name} · ${money(s.price)}${state.time?' · '+state.time:''}`:'Escolha um serviço';
  $('#summaryContent').innerHTML=rows([['Serviço',s?.name||'A escolher'],['Profissional',b?.name||'A escolher'],['Data',state.date?dateLabel(state.date):'A escolher'],['Horário',state.time||'A escolher'],['Forma de pagamento',paymentLabels[state.paymentMethod]],['Total',money(s?.price||0),'total'],['Valor a pagar agora',money(paidNow()),'pay-now'],['Restante na barbearia',money((s?.price||0)-paidNow())]]);
}
function selectButton(kind,value,body,selected,extra=''){return `<button type="button" class="choice" data-${kind}="${value}" aria-pressed="${selected}" ${extra}>${body}</button>`;}
function render(focus=true){
  const [label,title,description]=steps[step];
  $('#stepCount').textContent=`Etapa ${step+1} de 7 · ${label}`;
  $('#stepTitle').textContent=title;$('#stepDescription').textContent=description;
  $('#progress').innerHTML=[...steps.map(s=>s[0]),'Confirmação'].map((s,i)=>`<li class="${i===step?'current':i<step?'done':''}" ${i===step?'aria-current="step"':''} aria-label="${i+1}. ${s}"></li>`).join('');
  $('#stepError').hidden=true;$('#backBtn').hidden=step===0;
  $('#nextBtn').textContent=step===5?(state.paymentMethod==='local'?'Reservar horário':'Simular pagamento aprovado'):'Continuar';
  const content=$('#stepContent');
  if(step===0) content.innerHTML='<div class="choice-list">'+config.services.map(s=>selectButton('service',s.id,`<span class="choice-main"><strong>${s.name}</strong><small>${s.duration} min · ${s.detail}</small></span><span class="price">${money(s.price)}</span>`,state.serviceId===s.id)).join('')+'</div>';
  if(step===1) {
    const bookings=getBookings();
    content.innerHTML='<div class="choice-list">'+config.barbers.map(b=>{
      const available=nextDates().find(date=>config.times.some(time=>!slotReason({date,time,serviceId:state.serviceId,barberId:b.id},bookings)));
      return selectButton('barber',b.id,`<span class="avatar" aria-hidden="true">${b.initials}</span><span class="choice-main"><strong>${b.name}</strong><small>${b.specialty}</small><small class="availability">${available?`Horários ${available===dateKey()?'hoje':'a partir de '+dateLabel(available)}`:'Sem horários neste período'}</small></span>`,state.barberId===b.id);
    }).join('')+'</div>';
  }
  if(step===2){const bookings=getBookings();content.innerHTML='<div class="date-grid">'+nextDates().map(date=>{
    const closed=parseDate(date).getDay()===0;
    const unavailable=closed||!config.times.some(time=>!slotReason({...state,date,time},bookings));
    return `<button class="date-choice" data-date="${date}" aria-pressed="${state.date===date}" aria-label="${dateLabel(date,true)}${unavailable?', '+(closed?'fechado':'sem horários'):''}" ${unavailable?'disabled':''}><span>${date===dateKey()?'Hoje':parseDate(date).toLocaleDateString('pt-BR',{weekday:'short'})}</span><strong>${dateLabel(date)}</strong><small>${closed?'Fechado':unavailable?'Sem horários':'Disponível'}</small></button>`;
  }).join('')+'</div>';}
  if(step===3){const bookings=getBookings();content.innerHTML=`<p class="date-context">${dateLabel(state.date,true)} · ${barberById(state.barberId).name.split(' ')[0]}</p><div class="time-grid">`+config.times.map(time=>{
    const reason=slotReason({...state,time},bookings);
    return `<button class="time-choice" data-time="${time}" aria-pressed="${state.time===time}" ${reason?'disabled':''}><span>${time}</span>${reason?`<small>${reason}</small>`:''}</button>`;
  }).join('')+'</div>';if(config.times.every(time=>slotReason({...state,time},bookings)))content.innerHTML+='<p class="notice">Este dia ficou sem horários. Volte e escolha outra data.</p>';}
  if(step===4) content.innerHTML=`<form id="customerForm" class="form-fields" novalidate><div class="field"><label for="customerName">Nome</label><input id="customerName" name="name" autocomplete="name" maxlength="70" placeholder="Ex.: Bruno Almeida" value="${e(customer.name)}" aria-describedby="nameError" required><small class="field-error" id="nameError"></small></div><div class="field"><label for="customerPhone">WhatsApp</label><input id="customerPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" maxlength="20" placeholder="(85) 90000-0000" value="${e(customer.phone)}" aria-describedby="phoneHint phoneError" required><small id="phoneHint">Informe o DDD e o número. Nenhuma mensagem será enviada.</small><small class="field-error" id="phoneError"></small></div><button type="submit" hidden>Continuar</button></form>`;
  if(step===5){content.innerHTML='<div class="choice-list">'+[
    ['pix','Pix','Recomendado · Sinal de 30%'],['card','Cartão','Pagamento integral simulado'],['local','Pagar no local','Você paga após o atendimento.']
  ].map(([id,name,detail])=>selectButton('payment',id,`<span class="choice-main"><strong>${name}</strong><small>${detail}</small></span>`,state.paymentMethod===id)).join('')+'</div><div class="payment-info" id="paymentInfo"></div>';renderPayment();}
  summary();
  if (focus) {
    $('#stepTitle').focus({preventScroll:true});
    if ($('.booking-sheet').getBoundingClientRect().top < 0) $('.booking-sheet').scrollIntoView({block:'start'});
  }
}
function renderPayment(){
  let html='';
  if(state.paymentMethod==='pix') html=`<h3>Pague 30% agora para garantir seu horário.</h3><strong class="payment-amount">${money(paidNow())}</strong><p>Restante na barbearia: ${money(serviceById(state.serviceId).price-paidNow())}</p><div class="qr-demo" role="img" aria-label="QR fictício, não utilizável para pagamento">${'<i></i>'.repeat(225)}</div><p class="pix-code" id="pixCode">${config.pixCode}</p><button class="btn secondary" id="copyPix">Copiar código demonstrativo</button>`;
  if(state.paymentMethod==='card') html=`<h3>Cartão de demonstração</h3><p>Use somente dados fictícios. Deixamos um cartão cenográfico pronto: não é preciso digitar nenhum dado financeiro.</p><div class="demo-card"><span>CADEIRA85 · CARTÃO FICTÍCIO</span><strong>•••• &nbsp; •••• &nbsp; •••• &nbsp; DEMO</strong><small>CLIENTE DEMONSTRAÇÃO · SEM VALIDADE</small></div><p>Pagamento integral: <strong>${money(paidNow())}</strong></p>`;
  if(state.paymentMethod==='local') html='<h3>Você paga após o atendimento.</h3><p>Nenhum valor agora. Seu horário será confirmado ao finalizar a reserva.</p>';
  $('#paymentInfo').innerHTML=html+'<p class="notice">Pagamento demonstrativo. Nenhuma cobrança será realizada.</p>';
}
function validateCustomer(){
  customer={name:$('#customerName').value.trim(),phone:$('#customerPhone').value.trim()};
  const digits=customer.phone.replace(/\D/g,'').replace(/^55(?=\d{10,11}$)/,'');
  const nameOK=(customer.name.match(/\p{L}/gu)||[]).length>=2 && /^[\p{L}\p{M} .’'-]+$/u.test(customer.name);
  const phoneOK=/^[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/.test(digits);
  $('#nameError').textContent=nameOK?'':'Digite um nome com pelo menos 2 letras.';
  $('#phoneError').textContent=phoneOK?'':'Informe um WhatsApp com DDD, por exemplo (85) 90000-0000.';
  $('#customerName').setAttribute('aria-invalid',!nameOK);$('#customerPhone').setAttribute('aria-invalid',!phoneOK);
  if(!nameOK||!phoneOK){$(nameOK?'#customerPhone':'#customerName').focus();return false;}
  customer.phone=`(${digits.slice(0,2)}) ${digits.slice(2,-4)}-${digits.slice(-4)}`;return true;
}
async function advance(){
  if(saving||finished)return;
  if(step<4){const field=['serviceId','barberId','date','time'][step];if(!state[field]){error(`Escolha ${['um serviço','um profissional','uma data','um horário'][step]} para continuar.`);return;}}
  if(step===4&&!validateCustomer())return;
  if(step<5){step++;render();return;}
  saving=true;$('#nextBtn').disabled=true;$('#nextBtn').textContent='Reservando…';
  try{const booking=await createBooking(state,customer,true);finished=true;showConfirmation(booking);}catch(err){error(err.message);saving=false;$('#nextBtn').disabled=false;$('#nextBtn').textContent=state.paymentMethod==='local'?'Reservar horário':'Simular pagamento aprovado';}
}
function error(message){$('#stepError').textContent=message;$('#stepError').hidden=false;}
function showConfirmation(b){
  clearTimeout(toast.timer); $('#toast').hidden=true;
  $('#bookingExperience').hidden=true;$('#confirmation').hidden=false;
  const barber=barberById(b.barberId),service=serviceById(b.serviceId);
  $('#confirmation').innerHTML=`<div class="success-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h2 id="successTitle" tabindex="-1">Horário reservado!</h2><p>${e(b.customer)}, seu ${service.name.toLocaleLowerCase('pt-BR')} com ${barber.name.split(' ')[0]} está marcado para ${dateLabel(b.date,true)}, às ${b.time}.</p>${b.paidAmount?`<p class="success-note">${b.paymentMethod==='pix'?'Sinal':'Pagamento'} de ${money(b.paidAmount)} confirmado na simulação.</p>`:''}<div class="receipt-status"><span class="badge confirmed">Confirmado</span><span class="badge ${b.paymentStatus}">${paymentStatuses[b.paymentStatus]}</span></div>`+rows([['Cliente',b.customer],['Serviço',service.name],['Profissional',barber.name],['Data',dateLabel(b.date,true)],['Horário',b.time],['Total',money(b.price),'total'],['Forma de pagamento',paymentLabels[b.paymentMethod]],['Status','Confirmado'],['Valor pago',money(b.paidAmount)],['Valor restante',money(b.price-b.paidAmount)]])+`<div class="actions"><a class="btn primary" href="painel.html?booking=${encodeURIComponent(b.id)}">Ver no painel da barbearia</a><a class="btn secondary" href="agendar.html">Fazer outro agendamento</a></div><p class="fine-print">Demonstração concluída. Nenhuma cobrança ou mensagem foi enviada. A reserva está salva neste navegador.</p>`;
  $('#successTitle').focus();
}
$('#nextBtn').addEventListener('click',advance);
$('#backBtn').addEventListener('click',()=>{if(step===4){customer={name:$('#customerName').value,phone:$('#customerPhone').value};}step--;render();});
$('#stepContent').addEventListener('submit',event=>{event.preventDefault();advance();});
$('#stepContent').addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  const map={service:'serviceId',barber:'barberId',date:'date',time:'time',payment:'paymentMethod'};
  for(const [key,field] of Object.entries(map))if(button.dataset[key]){
    const value=button.dataset[key];if(state[field]!==value){state[field]=value;if(key==='service'||key==='barber'){state.date=null;state.time=null;}if(key==='date')state.time=null;}
    render(false);document.querySelector(`[data-${key}="${value}"]`)?.focus({preventScroll:true});return;
  }
  if(button.id==='copyPix'){
    try{await navigator.clipboard.writeText(config.pixCode);toast('Código demonstrativo copiado. Ele não realiza pagamentos.');button.textContent='Código copiado';}
    catch{toast('A cópia não está disponível. Selecione o código demonstrativo acima.');}
  }
});
window.addEventListener('storage',()=>{if(finished)return;try{if(state.time&&slotReason(state)){state.time=null;summary();}if(step===2||step===3)render(false);}catch(err){showError(err);}});
commonSetup();
try{
  getBookings();
  const params=new URLSearchParams(location.search);
  const preselected={serviceId:params.get('service'),barberId:params.get('barber'),date:params.get('date'),time:params.get('time')};
  if(preselected.time&&!slotReason(preselected)){Object.assign(state,preselected);}
  $('#summaryDetails').open=matchMedia('(min-width:761px)').matches;
  render(false);
}catch(err){showError(err);$('#bookingExperience').hidden=true;}
