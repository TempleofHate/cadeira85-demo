/* Run with NODE_PATH pointing to Playwright + @axe-core/playwright installed outside the static app. */
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.DEMO_URL || 'http://127.0.0.1:8080/cadeira85-demo-v2/';
const out = '.impeccable/review';
fs.mkdirSync(out, { recursive: true });
const results={journeys:[],responsive:[],accessibility:[],errors:[],assets:[],extra:[]};
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'America/Fortaleza',permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();
 page.on('pageerror',err=>results.errors.push(err.message));
 page.on('console',msg=>{if(msg.type()==='error')results.errors.push(msg.text())});
 page.on('response',r=>{if(r.status()>=400)results.assets.push([r.url(),r.status()])});
 await page.clock.setFixedTime(new Date('2026-09-11T11:00:00Z'));
 await page.goto(base);await page.evaluate(()=>localStorage.clear());
 async function capture(options){if(process.env.NO_CAPTURE)return;await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot(options);}
 const storage=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cadeira85_demo_v4')).bookings);
 async function book(method,name){
  await page.goto(base);
  await page.getByRole('link',{name:'Testar agendamento',exact:true}).click();
  assert.doesNotMatch(await page.locator('#summaryContent').textContent(),/R\$|Pix/);
  await page.locator('[data-service="combo"]').click();await page.locator('#nextBtn').click();
  await page.locator('[data-barber="lucas"]').click();await page.locator('#nextBtn').click();
  await page.locator('[data-date]:not(:disabled)').first().click();await page.locator('#nextBtn').click();
  const slot=page.locator('[data-time]:not(:disabled)').first();const time=await slot.getAttribute('data-time');
  await slot.click();await page.locator('#nextBtn').click();
  if(method==='pix'){
   await page.locator('#nextBtn').click();assert.match(await page.locator('#nameError').innerText(),/Digite/);
   await page.locator('#customerName').fill('Teste');await page.locator('#customerPhone').fill('123');await page.locator('#nextBtn').click();assert.match(await page.locator('#phoneError').innerText(),/DDD/);
  }
  await page.locator('#customerName').fill(name);await page.locator('#customerPhone').fill('(85) 99999-1234');await page.locator('#nextBtn').click();
  await page.locator(`[data-payment="${method}"]`).click();
  assert.match(await page.locator('#summaryContent').textContent(),/Valor a pagar agora/);
  if(method==='pix'){
   await page.locator('#copyPix').click();await page.locator('#toast').waitFor({state:'visible'});assert.match(await page.locator('#toast').innerText(),/copiado/);
   assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'DEMONSTRACAO-CADEIRA85-SEM-VALOR-NAO-E-UM-PIX');
   await capture({path:out+'/pix-390.png',fullPage:true});
   const a=await new AxeBuilder({page}).analyze();results.accessibility.push({surface:'Pix',violations:a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
  }
  if(method==='card'){assert.equal(await page.locator('input').count(),0);await capture({path:out+'/card-390.png',fullPage:true});}
  await page.locator('#nextBtn').click();await page.locator('#successTitle').waitFor();
  assert.match(await page.locator('#confirmation').innerText(),/Horário reservado!/);
  const b=(await storage()).find(b=>b.customer===name);assert.ok(b);assert.equal(b.time,time);assert.equal(b.paidAmount,method==='pix'?16.5:method==='card'?55:0);
  await capture({path:out+`/confirmation-${method}-390.png`,fullPage:true});
  await page.getByRole('link',{name:'Ver no painel da barbearia',exact:true}).click();
  assert.match(await page.locator('#booking-'+b.id).innerText(),new RegExp(name));
  results.journeys.push(`${method}: landing → agendamento → pagamento → confirmação → painel`);
  return b;
 }
 const pix=await book('pix','Cliente Pix');
 const card=await book('card','Cliente Cartão');
 await book('local','Cliente Local');
 async function toSlots(){await page.goto(base+'agendar.html');await page.locator('[data-service="combo"]').click();await page.locator('#nextBtn').click();await page.locator('[data-barber="lucas"]').click();await page.locator('#nextBtn').click();await page.locator(`[data-date="${pix.date}"]`).click();await page.locator('#nextBtn').click();}
 await toSlots();assert.ok(await page.locator(`[data-time="${pix.time}"]`).isDisabled());assert.ok(await page.locator('[data-time="10:20"]').isDisabled());results.journeys.push('D: horário reservado e sobreposição de duração bloqueados');
 await page.goto(base+'painel.html');const revenue=await page.locator('#kpiRevenue').innerText();
 await page.locator(`#booking-${pix.id} [data-action="cancelled"]`).click();assert.ok(await page.locator('#confirmDialog').isVisible());assert.equal(await page.evaluate(()=>document.activeElement.id),'dialogCancel');
 await page.keyboard.press('Escape');assert.ok(await page.locator('#confirmDialog').isHidden());
 await page.locator(`#booking-${pix.id} [data-action="cancelled"]`).click();
 await page.locator('#dialogAccept').click();await page.waitForFunction(id=>JSON.parse(localStorage.getItem('cadeira85_demo_v4')).bookings.find(b=>b.id===id).status==='cancelled',pix.id);
 assert.notEqual(await page.locator('#kpiRevenue').innerText(),revenue);
 await toSlots();assert.ok(await page.locator(`[data-time="${pix.time}"]`).isEnabled());results.journeys.push('E: cancelar libera disponibilidade e atualiza receita');
 await page.reload();const bookings=await storage();assert.equal(bookings.find(b=>b.id===pix.id).status,'cancelled');assert.equal(bookings.find(b=>b.id===card.id).paidAmount,55);results.journeys.push('F: reload preserva reservas, cancelamento e pagamentos');
 await page.goto(base+'painel.html');await page.locator('[data-action="confirmed"]').first().click();await page.locator(`#booking-${card.id} [data-action="completed"]`).click();await page.waitForFunction(id=>JSON.parse(localStorage.getItem('cadeira85_demo_v4')).bookings.find(b=>b.id===id).status==='completed',card.id);assert.equal((await storage()).find(b=>b.id===card.id).status,'completed');results.extra.push('Confirmar e concluir, sem cobrança implícita do saldo');
 await page.locator('#dateFilter').selectOption('all');await page.locator('#statusFilter').selectOption('cancelled');await page.locator('#barberFilter').selectOption('rafael');assert.match(await page.locator('#appointments').innerText(),/Nenhum agendamento/);await page.locator('#clearFilters').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'dateFilter');results.extra.push('Estado vazio e limpeza de filtros com recuperação de foco');
 await page.locator('#resetBtn').click();await page.locator('#dialogCancel').click();assert.ok((await storage()).some(b=>!b.seed));
 await page.locator('#resetBtn').click();await page.locator('#dialogAccept').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('cadeira85_demo_v4')).bookings.every(b=>b.seed));results.journeys.push('G: restauração com confirmação retorna aos dados iniciais');
 for(const width of [360,390,430,768,1440]){
  await page.setViewportSize({width,height:width>1000?1000:844});
  for(const route of ['index','agendar','painel']){
   await page.goto(base+route+'.html');await page.evaluate(()=>document.fonts.ready);
   await capture({path:`${out}/${route}-${width}.png`,fullPage:true});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   const tiny=await page.locator('button,a,select,input,summary').evaluateAll(els=>els.filter(el=>el.getClientRects().length&&!el.classList.contains('skip-link')).filter(el=>el.getBoundingClientRect().height<43).map(el=>({text:el.textContent.slice(0,50),h:el.getBoundingClientRect().height})));
   results.responsive.push({route,width,overflow,tiny});
   if(width===390){const a=await new AxeBuilder({page}).analyze();results.accessibility.push({surface:route,violations:a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});}
   if(route==='agendar'){
    for(const stage of [1,2,3,4]){
     if(stage===1)await page.locator('[data-service="combo"]').click();
     if(stage===2)await page.locator('[data-barber="lucas"]').click();
     if(stage===3)await page.locator('[data-date]:not(:disabled)').first().click();
     if(stage===4)await page.locator('[data-time]:not(:disabled)').first().click();
     await page.locator('#nextBtn').click();
     const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
     results.responsive.push({route:'agendar-etapa-'+(stage+1),width,overflow,tiny:[]});
     assert.ok(!overflow);
     if(width===390)await capture({path:out+'/booking-step-'+(stage+1)+'-390.png',fullPage:true});
    }
   }
   const links=await page.locator('a[href]').evaluateAll(els=>els.map(el=>el.getAttribute('href')).filter(h=>!h.startsWith('#')&&!h.startsWith('http')));
   for(const link of new Set(links)){const r=await context.request.get(base+link);if(!r.ok())results.assets.push([link,r.status()]);}
  }
 }
 await page.goto(base+'agendar.html');await page.keyboard.press('Tab');await page.keyboard.press('Enter');await page.locator('[data-service="corte"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('[data-service="corte"]').getAttribute('aria-pressed'),'true');results.extra.push('Navegação por teclado, escolha com Space, foco visível, Escape no modal');
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#nextBtn').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');results.extra.push('Movimento reduzido');
 await page.goto(base+'painel.html');await page.evaluate(()=>localStorage.setItem('cadeira85_demo_v4','broken'));await page.reload();assert.match(await page.locator('#globalError').innerText(),/inválidos/);await page.locator('#resetBtn').click();await page.locator('#dialogAccept').click();await page.waitForFunction(()=>localStorage.getItem('cadeira85_demo_v4')!=='broken');assert.ok((await storage()).length);results.extra.push('Recuperação de dados corrompidos');
 await page.goto(base+'agendar.html?service=corte&barber=lucas&date=2026-09-12&time=08:00');
 assert.equal(await page.locator('[data-service="corte"]').getAttribute('aria-pressed'),'false');
 const invalid=await page.evaluate(async()=>{const m=await import('./storage.js');try{await m.createBooking({serviceId:'corte',barberId:'lucas',date:'2026-09-12',time:'08:00',paymentMethod:'local'},{name:'Cliente inválido',phone:'(85) 99999-1234'},true);return false;}catch{return m.getBookings().every(b=>b.time!=='08:00');}});
 assert.ok(invalid);results.extra.push('URL com horário inválido rejeitada sem corromper armazenamento');
 await page.goto(base+'painel.html');await page.locator('#statusFilter').selectOption('pending');await page.locator('[data-action="confirmed"]').first().click();await page.waitForFunction(()=>document.activeElement.id==='statusFilter');results.extra.push('Foco recuperado quando ação remove linha filtrada');
 // Two concurrent reservations must have a single winner when Web Locks is available.
 const race=await page.evaluate(async()=>{const m=await import('./storage.js');const sel={serviceId:'corte',barberId:'marcos',date:'2026-09-12',time:'09:00',paymentMethod:'local'};const r=await Promise.allSettled([m.createBooking(sel,{name:'Teste concorrente A',phone:'(85) 99999-1234'},true),m.createBooking(sel,{name:'Teste concorrente B',phone:'(85) 99999-1234'},true)]);return r.map(x=>x.status)});
 assert.equal(race.filter(s=>s==='fulfilled').length,1);results.extra.push('Duas reservas concorrentes: só uma confirmada');
 await page.clock.setFixedTime(new Date('2027-01-03T14:00:00Z'));await page.goto(base+'agendar.html');await page.locator('[data-service="corte"]').click();await page.locator('#nextBtn').click();await page.locator('[data-barber="lucas"]').click();await page.locator('#nextBtn').click();assert.ok(await page.locator('[data-date="2027-01-03"]').isDisabled());assert.ok(await page.locator('[data-date="2027-01-04"]').isEnabled());results.extra.push('Datas dinâmicas em janeiro de 2027 e domingo indisponível');
 await page.goto(base+'painel.html');assert.equal(await page.locator('#dateFilter').inputValue(),'tomorrow');
 assert.ok((await storage()).filter(b=>b.seed).every(b=>new Date(b.date+'T12:00:00').getDay()!==0));results.extra.push('Exemplos atualizados em nova data, domingo sem reservas fictícias');
 const deniedContext=await browser.newContext();const denied=await deniedContext.newPage();await denied.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','QuotaExceededError')}});await denied.goto(base+'agendar.html');await denied.locator('#globalError').waitFor({state:'visible'});assert.ok(await denied.locator('#bookingExperience').isHidden());assert.match(await denied.locator('#globalError').innerText(),/armazenamento/);await deniedContext.close();results.extra.push('Armazenamento bloqueado: erro compreensível, sem falsa confirmação');
 await page.goto(base);await page.locator('#contactBtn').click();assert.ok(await page.locator('#contactNotice').isVisible());results.extra.push('Contato não configurado: placeholder explicado, sem destino inventado');

 assert.equal(results.errors.length,0);assert.equal(results.assets.length,0);assert.ok(results.responsive.every(r=>!r.overflow&&!r.tiny.length));assert.ok(results.accessibility.every(r=>!r.violations.length));
 fs.writeFileSync(out+'/test-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(err=>{fs.writeFileSync(out+'/test-results.json',JSON.stringify({...results,failure:err.stack},null,2));console.error(err);process.exit(1)});
