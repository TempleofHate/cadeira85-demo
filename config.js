const Cadeira85 = (() => {
  const business = {
    productName: 'Cadeira85',
    shopName: 'Barbearia Prime',
    tagline: 'Agendamento simples. Agenda cheia.',
    address: 'Av. Exemplo, 120 — Fortaleza, CE',
    whatsapp: '(85) 99999-9999',
    openingHours: 'Seg–Sáb • 09:00–20:00'
  };

  const services = [
    { id: 'corte', name: 'Corte', duration: 40, price: 35, description: 'Corte personalizado e finalização.' },
    { id: 'barba', name: 'Barba', duration: 30, price: 25, description: 'Desenho, acabamento e toalha quente.' },
    { id: 'combo', name: 'Corte + Barba', duration: 60, price: 55, description: 'Pacote completo para sair renovado.' },
    { id: 'sobrancelha', name: 'Sobrancelha', duration: 15, price: 15, description: 'Acabamento rápido e preciso.' }
  ];

  const barbers = [
    { id: 'lucas', name: 'Lucas Silva', initials: 'LS', specialty: 'Degradê e social' },
    { id: 'rafael', name: 'Rafael Costa', initials: 'RC', specialty: 'Barba e navalha' },
    { id: 'marcos', name: 'Marcos Lima', initials: 'ML', specialty: 'Cachos e freestyle' }
  ];

  const slots = ['09:00','09:40','10:20','11:00','11:40','13:00','13:40','14:20','15:00','15:40','16:20','17:00','17:40','18:20','19:00','19:40'];
  const STORAGE_KEY = 'cadeira85_bookings_v2';

  const isoDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const addDays = (days) => {
    const date = new Date();
    date.setHours(12,0,0,0);
    date.setDate(date.getDate() + days);
    return date;
  };

  const seed = () => {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return;
    const demo = [
      { id: crypto.randomUUID?.() || `seed-${Date.now()}-1`, customer: 'André', phone: '(85) 98888-1001', serviceId: 'corte', barberId: 'lucas', date: isoDate(addDays(0)), time: '10:20', status: 'confirmado', createdAt: new Date().toISOString() },
      { id: crypto.randomUUID?.() || `seed-${Date.now()}-2`, customer: 'Bruno', phone: '(85) 98888-1002', serviceId: 'combo', barberId: 'rafael', date: isoDate(addDays(0)), time: '13:40', status: 'confirmado', createdAt: new Date().toISOString() },
      { id: crypto.randomUUID?.() || `seed-${Date.now()}-3`, customer: 'Carlos', phone: '(85) 98888-1003', serviceId: 'barba', barberId: 'marcos', date: isoDate(addDays(0)), time: '17:00', status: 'pendente', createdAt: new Date().toISOString() },
      { id: crypto.randomUUID?.() || `seed-${Date.now()}-4`, customer: 'Diego', phone: '(85) 98888-1004', serviceId: 'corte', barberId: 'lucas', date: isoDate(addDays(1)), time: '15:00', status: 'confirmado', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  };

  const getBookings = () => {
    seed();
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  };

  const saveBookings = (bookings) => localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  const addBooking = (booking) => {
    const all = getBookings();
    all.push({ ...booking, id: crypto.randomUUID?.() || `b-${Date.now()}`, createdAt: new Date().toISOString() });
    saveBookings(all);
    return all.at(-1);
  };
  const updateBooking = (id, patch) => {
    const all = getBookings().map(item => item.id === id ? { ...item, ...patch } : item);
    saveBookings(all);
    return all;
  };
  const resetDemo = () => { localStorage.removeItem(STORAGE_KEY); seed(); };
  const money = (value) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(value);
  const serviceById = id => services.find(s => s.id === id);
  const barberById = id => barbers.find(b => b.id === id);

  return { business, services, barbers, slots, isoDate, addDays, getBookings, addBooking, updateBooking, resetDemo, money, serviceById, barberById };
})();
