window.C85 = {
  business: {
    name: 'Barbearia Prime',
    address: 'Av. Exemplo, 120 — Fortaleza, CE',
    hours: 'Seg–Sáb, 09:00–20:00'
  },
  services: [
    {id:'corte', name:'Corte', duration:40, price:35},
    {id:'barba', name:'Barba', duration:30, price:25},
    {id:'combo', name:'Corte + Barba', duration:60, price:55},
    {id:'pezinho', name:'Acabamento / pezinho', duration:20, price:18}
  ],
  barbers: [
    {id:'lucas', name:'Lucas Silva', specialty:'Cortes clássicos', initials:'LS'},
    {id:'rafael', name:'Rafael Costa', specialty:'Fade e freestyle', initials:'RC'},
    {id:'marcos', name:'Marcos Lima', specialty:'Barba e acabamento', initials:'ML'}
  ],
  times: ['09:00','09:40','10:20','11:00','11:40','13:00','13:40','14:20','15:00','15:40','16:20','17:00','17:40','18:20','19:00'],
  storageKey: 'cadeira85_bookings_v3',
  currency(value){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value)},
  isoDate(date){return date.toISOString().slice(0,10)},
  formatDate(iso){return new Date(iso+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})},
  getBookings(){try{return JSON.parse(localStorage.getItem(this.storageKey)||'[]')}catch{return []}},
  setBookings(list){localStorage.setItem(this.storageKey,JSON.stringify(list))},
  seed(){
    if(localStorage.getItem(this.storageKey)) return;
    const today=this.isoDate(new Date());
    this.setBookings([
      {id:'seed1',date:today,time:'14:20',customer:'João',phone:'(85) 99911-2233',serviceId:'corte',barberId:'lucas',price:35,status:'confirmed',paymentMethod:'pix',paymentStatus:'signal_paid',paidAmount:10.5,createdAt:Date.now()-50000},
      {id:'seed2',date:today,time:'15:00',customer:'Mateus',phone:'(85) 99933-4455',serviceId:'combo',barberId:'rafael',price:55,status:'confirmed',paymentMethod:'card',paymentStatus:'paid',paidAmount:55,createdAt:Date.now()-40000},
      {id:'seed3',date:today,time:'15:40',customer:'Pedro',phone:'(85) 99955-6677',serviceId:'barba',barberId:'marcos',price:25,status:'pending',paymentMethod:'local',paymentStatus:'local',paidAmount:0,createdAt:Date.now()-30000}
    ])
  }
};
window.C85.seed();
