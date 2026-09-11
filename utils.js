export const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export const parseDate = value => new Date(`${value}T12:00:00`);
export const dateLabel = (value, long = false) => parseDate(value).toLocaleDateString('pt-BR', long ? { weekday:'long', day:'numeric', month:'long' } : { day:'2-digit', month:'2-digit' });
export function nextDates(count = 14) {
  return Array.from({length: count}, (_, i) => { const d = new Date(); d.setDate(d.getDate()+i); return dateKey(d); });
}
export const minutes = time => Number(time.slice(0,2))*60 + Number(time.slice(3));
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const paymentLabels = { pix:'Pix · sinal de 30%', card:'Cartão · valor integral', local:'Pagar no local' };
export const statusLabels = { pending:'Pendente', confirmed:'Confirmado', completed:'Concluído', cancelled:'Cancelado' };
export const paymentStatuses = { signal_paid:'Sinal pago', paid:'Pago', local:'Pagamento no local', pending:'Pendente' };
export const $ = selector => document.querySelector(selector);
export function toast(message) {
  const el = $('#toast'); el.textContent = message; el.hidden = false;
  clearTimeout(toast.timer); toast.timer = setTimeout(() => { el.hidden = true; }, 4200);
}
export function showError(error) {
  const el = $('#globalError');
  el.textContent = error.message || String(error); el.hidden = false;
}
export function confirmAction(title, message, actionLabel) {
  const dialog = $('#confirmDialog');
  $('#dialogTitle').textContent = title; $('#dialogMessage').textContent = message;
  $('#dialogAccept').textContent = actionLabel;
  dialog.returnValue = ''; dialog.showModal();
  $('#dialogCancel').focus();
  return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), {once:true}));
}
export function commonSetup() {
  document.querySelectorAll('[data-business]').forEach(async el => {
    const {config} = await import('./config.js'); el.textContent = config.business.name;
  });
}
