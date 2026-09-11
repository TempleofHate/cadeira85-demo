import { config, serviceById, barberById } from './config.js';
import { $, money, dateKey, dateLabel, nextDates, escapeHTML as e, statusLabels, paymentStatuses, confirmAction, toast, showError, commonSetup } from './utils.js';
import { getBookings, changeStatus, restoreDemo } from './storage.js';
function render(){
  const all=getBookings().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const active=all.filter(b=>b.date===dateKey()&&b.status!=='cancelled');
  $('#kpiBookings').textContent=active.length;
  $('#kpiConfirmed').textContent=active.filter(b=>b.status==='confirmed').length;
  $('#kpiRevenue').textContent=money(active.reduce((sum,b)=>sum+b.price,0));
  $('#kpiDeposits').textContent=money(active.filter(b=>b.paymentStatus==='signal_paid').reduce((sum,b)=>sum+b.paidAmount,0));
  const pending=all.filter(b=>b.status==='pending'&&b.date>=dateKey());
  $('#attentionText').textContent=pending.length?`${pending.length} agendamento${pending.length===1?' precisa':'s precisam'} de confirmação. Confira antes do atendimento.`:'Tudo em ordem. Nenhum agendamento aguardando confirmação.';
  $('#pendingBtn').hidden=!pending.length;
  const period=$('#dateFilter').value,barber=$('#barberFilter').value,status=$('#statusFilter').value;
  const list=all.filter(b=>(period==='all'||b.date===(period==='today'?dateKey():nextDates(2)[1]))&&(barber==='all'||b.barberId===barber)&&(status==='all'||b.status===status));
  $('#resultCount').textContent=`${list.length} agendamento${list.length===1?'':'s'}`;
  let lastDate='';
  $('#appointments').innerHTML=list.length?list.map(b=>{
    let heading='';if(lastDate!==b.date){lastDate=b.date;heading=`<h3 class="day-heading">${b.date===dateKey()?'Hoje · ':''}${dateLabel(b.date,true)}</h3>`;}
    const actions=b.status==='pending'?['confirmed','cancelled']:b.status==='confirmed'?['completed','cancelled']:[];
    return heading+`<article class="appointment ${b.status==='cancelled'?'is-cancelled':''}" id="booking-${e(b.id)}" aria-label="${e(b.customer)}, ${b.time}"><div class="appointment-time"><time datetime="${b.date}T${b.time}">${b.time}</time><small>${serviceById(b.serviceId).duration} min</small></div><div><h3>${e(b.customer)}</h3><p class="appointment-description">${serviceById(b.serviceId).name} · ${barberById(b.barberId).name}</p><p class="appointment-phone">${e(b.phone)}</p><div class="appointment-badges"><span class="badge ${b.status}">${statusLabels[b.status]}</span><span class="badge ${b.paymentStatus}">${paymentStatuses[b.paymentStatus]}</span></div></div><div class="appointment-price">${money(b.price)}<small>${money(b.paidAmount)} pago</small></div>${actions.length?`<div class="appointment-actions">${actions.map(action=>`<button data-id="${e(b.id)}" data-action="${action}" aria-label="${{confirmed:'Confirmar',cancelled:'Cancelar',completed:'Concluir'}[action]} agendamento de ${e(b.customer)}">${{confirmed:'Confirmar',cancelled:'Cancelar',completed:'Concluir'}[action]}</button>`).join('')}</div>`:''}</article>`;
  }).join(''):'<div class="empty"><h3>Nenhum agendamento por aqui.</h3><p>Tente outro período ou profissional. Você também pode criar uma nova reserva.</p><button class="text-link" id="clearFilters">Limpar filtros</button></div>';
}
async function act(event){
  const button=event.target.closest('button');if(!button)return;
  if(button.id==='clearFilters'){$('#dateFilter').value='all';$('#barberFilter').value='all';$('#statusFilter').value='all';safeRender();$('#dateFilter').focus({preventScroll:true});return;}
  const {id,action}=button.dataset;if(!id)return;
  try{
    if(action==='cancelled'){
      const b=getBookings().find(b=>b.id===id);
      if(!await confirmAction('Cancelar este agendamento?',`${b.customer}, ${dateLabel(b.date)} às ${b.time}. O horário ficará disponível novamente, se não houver outro atendimento sobreposto.${b.paidAmount?' O pagamento simulado será mantido no histórico; não há estorno real.':''}`,'Cancelar agendamento'))return;
    }
    button.disabled=true;
    await changeStatus(id,action);render();toast(`Agendamento ${statusLabels[action].toLowerCase()}.`);
    const target=document.getElementById(`booking-${id}`);if(target){target.tabIndex=-1;target.focus({preventScroll:true});}else $('#statusFilter').focus({preventScroll:true});
  }catch(err){showError(err);button.disabled=false;}
}
function safeRender(){try{render();}catch(err){showError(err);}}
commonSetup();
$('#todayLabel').textContent=dateLabel(dateKey(),true);
$('#barberFilter').insertAdjacentHTML('beforeend',config.barbers.map(b=>`<option value="${b.id}">${b.name}</option>`).join(''));
for(const id of ['dateFilter','barberFilter','statusFilter'])$('#'+id).addEventListener('change',safeRender);
$('#appointments').addEventListener('click',act);
$('#pendingBtn').addEventListener('click',()=>{$('#dateFilter').value='all';$('#barberFilter').value='all';$('#statusFilter').value='pending';safeRender();$('#statusFilter').focus();});
$('#resetBtn').addEventListener('click',async()=>{
  if(!await confirmAction('Restaurar a demonstração?','Os agendamentos criados neste navegador serão removidos e substituídos pelos exemplos iniciais, com datas atualizadas. Esta ação não pode ser desfeita.','Restaurar dados'))return;
  try{restoreDemo();$('#globalError').hidden=true;for(const id of ['dateFilter','barberFilter','statusFilter'])$('#'+id).value='all';$('#dateFilter').value=new Date().getDay()===0?'tomorrow':'today';render();toast('Dados da demonstração restaurados.');}catch(err){showError(err);}
});
window.addEventListener('storage',safeRender);
const recent=new URLSearchParams(location.search).get('booking');
if(recent) $('#dateFilter').value='all';
else if(new Date().getDay()===0) {$('#dateFilter').value='tomorrow';$('#todayLabel').textContent+=' · Hoje estamos fechados.';}
safeRender();
if(recent){const target=document.getElementById(`booking-${recent}`);if(target){target.tabIndex=-1;target.focus();toast('Sua nova reserva já está na agenda.');}}
