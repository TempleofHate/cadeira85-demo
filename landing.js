import { config, serviceById } from './config.js';
import { nextDates, dateLabel, $, commonSetup, escapeHTML as e, paymentStatuses } from './utils.js';
import { slotReason, getBookings } from './storage.js';
commonSetup();
try {
  const bookings=getBookings();
  const date=nextDates().find(date=>config.times.some(time=>!slotReason({date,time,barberId:'lucas',serviceId:'corte'},bookings)));
  if (date) {
    $('#previewDate').textContent=dateLabel(date,true);
    const preview=bookings.filter(b=>b.date===date && b.barberId==='lucas' && b.status!=='cancelled').slice(0,2);
    $('#previewBookings').innerHTML=preview.length?preview.map(b=>`<div class="preview-entry"><time>${b.time}</time><div><strong>${e(b.customer)}</strong><span>${serviceById(b.serviceId).name} · ${serviceById(b.serviceId).duration} min</span></div><span class="badge ${b.paymentStatus}">${paymentStatuses[b.paymentStatus]}</span></div>`).join(''):'<p class="preview-empty">A agenda está livre. Escolha um horário abaixo.</p>';
    $('#previewSlots').innerHTML=config.times.filter(time=>!slotReason({date,time,barberId:'lucas',serviceId:'corte'},bookings)).slice(0,3).map(time=>`<a href="agendar.html?date=${date}&time=${time}&barber=lucas&service=corte" aria-label="Testar reserva às ${time}">${time}</a>`).join('');
  } else $('#previewSlots').innerHTML='<a href="agendar.html">Ver agenda</a>';
} catch { $('#previewSlots').innerHTML='<a href="agendar.html">Testar agendamento</a>'; }
$('#contactBtn').addEventListener('click',()=>{
  if (/^\d{12,13}$/.test(config.contact.whatsapp)) window.open(`https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(config.contact.message)}`,'_blank','noopener,noreferrer');
  else { $('#contactNotice').hidden=false; $('#contactBtn').setAttribute('aria-expanded','true'); }
});
