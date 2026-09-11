// Configuração única da demo. Use apenas números no formato internacional.
export const config = {
  product: 'Cadeira85',
  business: { name: 'Barbearia Horizonte', hours: 'Segunda a sábado, das 9h às 20h', city: 'Fortaleza, CE' },
  contact: {
    whatsapp: '', // PLACEHOLDER: substitua pelo número comercial real com DDI e DDD.
    message: 'Olá! Vi a demonstração do Cadeira85 e quero uma versão para minha barbearia.'
  },
  storageKey: 'cadeira85_demo_v4',
  services: [
    { id: 'corte', name: 'Corte', duration: 40, price: 35, detail: 'Seu estilo, com acabamento caprichado.' },
    { id: 'barba', name: 'Barba', duration: 30, price: 25, detail: 'Desenho e cuidado em cada detalhe.' },
    { id: 'combo', name: 'Corte + Barba', duration: 60, price: 55, detail: 'O cuidado completo, em uma visita.' },
    { id: 'sobrancelha', name: 'Corte + Sobrancelha', duration: 50, price: 45, detail: 'Corte alinhado, olhar renovado.' }
  ],
  barbers: [
    { id: 'lucas', name: 'Lucas Silva', initials: 'LS', specialty: 'Clássicos e tesoura' },
    { id: 'rafael', name: 'Rafael Costa', initials: 'RC', specialty: 'Degradê e cortes modernos' },
    { id: 'marcos', name: 'Marcos Lima', initials: 'ML', specialty: 'Barba e acabamento' }
  ],
  times: ['09:00','09:40','10:20','11:00','13:00','13:40','14:20','15:00','15:40','16:20','17:00','18:20'],
  pixCode: 'DEMONSTRACAO-CADEIRA85-SEM-VALOR-NAO-E-UM-PIX'
};
export const serviceById = id => config.services.find(item => item.id === id);
export const barberById = id => config.barbers.find(item => item.id === id);
