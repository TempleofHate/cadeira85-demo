import { config, serviceById, barberById } from './config.js';
import { dateKey, nextDates, parseDate, minutes } from './utils.js';
const storageError = () => new Error('Não foi possível salvar neste navegador. Permita o armazenamento do site e tente novamente.');
const isRecord = b => b && typeof b.id === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.date) && config.times.includes(b.time) && serviceById(b.serviceId) && barberById(b.barberId) && typeof b.customer === 'string' && typeof b.phone === 'string' && ['pending','confirmed','completed','cancelled'].includes(b.status) && ['pix','card','local'].includes(b.paymentMethod) && ['signal_paid','paid','local','pending'].includes(b.paymentStatus) && Number.isFinite(b.price) && b.price >= 0 && Number.isFinite(b.paidAmount) && b.paidAmount >= 0 && b.paidAmount <= b.price;
function write(data) {
  try { localStorage.setItem(config.storageKey, JSON.stringify(data)); } catch { throw storageError(); }
}
export function seedBookings() {
  const day = nextDates().find(date => parseDate(date).getDay() !== 0);
  const specs = [
    ['Bruno Almeida','09:00','corte','lucas','completed','pix','signal_paid'],
    ['Carlos Henrique','10:20','combo','rafael','confirmed','card','paid'],
    ['João Victor','14:20','corte','lucas','confirmed','pix','signal_paid'],
    ['Mateus Lima','15:40','barba','marcos','pending','local','local'],
    ['Pedro Gomes','17:00','sobrancelha','rafael','pending','pix','pending'],
    ['André Santos','13:00','corte','marcos','cancelled','local','local']
  ];
  const make = (spec,i,date) => {
    const [customer,time,serviceId,barberId,status,paymentMethod,paymentStatus] = spec;
    const price = serviceById(serviceId).price;
    return { id:`seed-${date}-${i}`,date,time,customer,phone:'(85) 90000-0000',serviceId,barberId,price,status,paymentMethod,paymentStatus,paidAmount:paymentStatus==='paid'?price:paymentStatus==='signal_paid'?Math.round(price*30)/100:0,createdAt:Date.now(),seed:true };
  };
  const rows = specs.map((s,i)=>make(s,i,day));
  for (const date of nextDates().filter(d=>d>day && parseDate(d).getDay()!==0).slice(0,2)) {
    rows.push(make(specs[2],6,date),make(specs[1],7,date));
  }
  return rows;
}
export function readStore() {
  let raw;
  try { raw = localStorage.getItem(config.storageKey); } catch { throw storageError(); }
  if (!raw) { const data = {version:4,seedDate:dateKey(),bookings:seedBookings()}; write(data); return data; }
  let data;
  try {
    data = JSON.parse(raw);
    if (data.version !== 4 || !Array.isArray(data.bookings) || !data.bookings.every(isRecord)) throw new Error();
  } catch { throw new Error('Os dados da demo estão inválidos. Use “Restaurar dados da demonstração” no painel para recomeçar.'); }
    if (data.seedDate !== dateKey()) {
      const created = data.bookings.filter(b => !b.seed);
      const examples = seedBookings().filter(example => !created.some(b => b.status !== 'cancelled' && b.date === example.date && b.barberId === example.barberId && minutes(b.time) < minutes(example.time) + serviceById(example.serviceId).duration && minutes(example.time) < minutes(b.time) + serviceById(b.serviceId).duration));
      data.bookings = [...created, ...examples];
      data.seedDate = dateKey();
      write(data);
    }
    return data;
}
export const getBookings = () => readStore().bookings;
export function restoreDemo() { write({version:4,seedDate:dateKey(),bookings:seedBookings()}); }
export function slotReason({date,time,barberId,serviceId}, bookings = getBookings()) {
  if (!date || !config.times.includes(time) || !barberById(barberId) || !serviceById(serviceId)) return 'Escolha as etapas anteriores';
  if (!nextDates().includes(date) || parseDate(date).getDay()===0) return 'Fechado';
  if (new Date(`${date}T${time}:00`) <= new Date()) return 'Já passou';
  const start=minutes(time), end=start+serviceById(serviceId).duration;
  if (end>1200) return 'Sem tempo para este serviço';
  return bookings.some(b=>b.date===date && b.barberId===barberId && b.status!=='cancelled' && start < minutes(b.time)+serviceById(b.serviceId).duration && end>minutes(b.time)) ? 'Reservado' : '';
}
export async function mutate(callback) {
  const run = () => { const data=readStore(); const result=callback(data.bookings); write(data); return result; };
  // Serializa alterações entre abas quando a API está disponível. Sem backend, não há sincronização entre aparelhos.
  return navigator.locks ? navigator.locks.request(config.storageKey, run) : run();
}
export async function createBooking(selection, customer, approved) {
  return mutate(bookings => {
    if (!['pix','card','local'].includes(selection.paymentMethod)) throw new Error('Escolha uma forma de pagamento.');
    if (typeof customer.name !== 'string' || (customer.name.match(/\p{L}/gu) || []).length < 2 || customer.name.length > 70 || typeof customer.phone !== 'string') throw new Error('Confira seu nome e WhatsApp antes de reservar.');
    const reason=slotReason(selection,bookings);
    if (reason) throw new Error('Este horário não está mais disponível. Volte e escolha outro horário.');
    const price=serviceById(selection.serviceId).price;
    const paidAmount=selection.paymentMethod==='local'?0:selection.paymentMethod==='pix'?Math.round(price*30)/100:price;
    if (selection.paymentMethod!=='local' && !approved) throw new Error('Simule a aprovação do pagamento para continuar.');
    const booking={...selection,customer:customer.name,phone:customer.phone,id:crypto.randomUUID(),price,paidAmount,status:'confirmed',paymentStatus:selection.paymentMethod==='local'?'local':selection.paymentMethod==='pix'?'signal_paid':'paid',createdAt:Date.now()};
    if (!isRecord(booking)) throw new Error('Não foi possível validar a reserva. Confira as escolhas e tente novamente.');
    bookings.push(booking); return booking;
  });
}
export async function changeStatus(id, status) {
  return mutate(bookings => {
    const booking=bookings.find(b=>b.id===id);
    const allowed={pending:['confirmed','cancelled'],confirmed:['completed','cancelled']};
    if (!booking || !allowed[booking.status]?.includes(status)) throw new Error('Este agendamento já foi atualizado. Confira o estado atual da agenda.');
    booking.status=status;
  });
}
