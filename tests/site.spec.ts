import { test, expect } from '@playwright/test';
const token='test-only-0123456789abcdef0123456789abcdef';
test('mobile navigation, training tabs and WhatsApp pre-registration',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Ouvrir le menu'}).click();await page.getByRole('link',{name:'Nos formations',exact:true}).click();
 await page.getByRole('tab',{name:/centre de formation/}).click();await expect(page.getByRole('heading',{name:'Cuisine & pâtisserie'})).toBeVisible();
 await page.getByRole('tab',{name:/lycée technique/}).click();await page.getByRole('link',{name:/F4/}).click();
 await expect(page.getByRole('heading',{level:1,name:'Génie civil'})).toBeVisible();
 await page.getByRole('link',{name:'Choisir cette formation'}).click();
 await expect(page.getByLabel('Formation souhaitée')).toHaveValue('F4');
 await page.getByLabel('Nom et prénom').fill('Test Apprenant');await page.getByLabel('Personne à contacter').fill('Test Parent');await page.getByLabel('Téléphone de contact').fill('0199999999');await page.getByLabel('Classe souhaitée').selectOption('Seconde');await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Préparer ma demande'}).click();
 const href=await page.getByRole('link',{name:'Continuer sur WhatsApp'}).getAttribute('href');expect(href).toContain('https://wa.me/2290195616244');expect(decodeURIComponent(href!)).toContain('Test Apprenant');expect(decodeURIComponent(href!)).toContain('Seconde');
 await page.getByLabel('Formation souhaitée').selectOption('CP');await expect(page.getByLabel('Classe souhaitée')).toHaveCount(0);await expect(page.getByRole('link',{name:'Continuer sur WhatsApp'})).toHaveCount(0);
});

test('every formation has its own illustrated detail page and selected registration',async({page,request})=>{
 test.setTimeout(120000);
 const routes = ['genie-civil','electrotechnique','developpement-web','maintenance-vehicules','hotellerie-restauration','electricite-batiment','cuisine-patisserie','panneaux-solaires','maconnerie','serigraphie','revetement-finitions'];
 const codes = ['F4','F3','DWEB','MMV','HR','EB','CP','IMPS','MAC','SER','REV'];
 for(let i=0;i<routes.length;i++){
  const response=await page.goto(`/formations/${routes[i]}`);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await expect(page.locator('.detail-image img')).toBeVisible();
  await expect.poll(()=>page.locator('.detail-image img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(page.getByRole('link',{name:'Choisir cette formation'})).toHaveAttribute('href',`/inscription?formation=${codes[i]}`);
  await expect(page.locator('.skill-card')).toHaveCount(4);
  await expect(page.locator('.career-list > div')).toHaveCount(3);
  expect((await request.get(`/images/formations/${codes[i].toLowerCase()}-card.webp`)).status()).toBe(200);
 }
 expect((await request.get('/formations/formation-inexistante')).status()).toBe(404);
});

test('reduced motion, accessible tabs and centre navigation on a narrow screen',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:360,height:800});
 await page.goto('/?parcours=centre#formations');
 await expect(page.getByRole('tab',{name:/centre de formation/})).toHaveAttribute('aria-selected','true');
 await page.getByRole('tab',{name:/centre de formation/}).focus();
 await page.keyboard.press('ArrowLeft');
 await expect(page.getByRole('tab',{name:/lycée technique/})).toBeFocused();
 await page.keyboard.press('End');
 await expect(page.getByRole('tab',{name:/centre de formation/})).toBeFocused();
 await page.getByRole('link',{name:/CP.*Cuisine/}).click();
 await expect(page.getByRole('heading',{level:1,name:'Cuisine & pâtisserie'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
 await expect(page.locator('.whatsapp-float svg path')).toHaveCount(1);
 await page.getByRole('link',{name:'Choisir cette formation'}).click();
 await expect(page.getByLabel('Formation souhaitée')).toHaveValue('CP');
 await expect(page.getByLabel('Classe souhaitée')).toHaveCount(0);
});
test('protected PDF publication, search and download',async({request,page})=>{
 const denied=await request.post('/api/documents');expect(denied.status()).toBe(401);
 const invalid=await request.post('/api/documents',{headers:{Authorization:`Bearer ${token}`},multipart:{title:'Invalide',formation:'F4',niveau:'Seconde',file:{name:'bad.pdf',mimeType:'application/pdf',buffer:Buffer.from('not a PDF')}}});expect(invalid.status()).toBe(400);
 const pdf=Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF');
 const uploaded=await request.post('/api/documents',{headers:{Authorization:`Bearer ${token}`},multipart:{title:'Exercices de construction',formation:'F4',niveau:'Seconde',file:{name:'cours.pdf',mimeType:'application/pdf',buffer:pdf}}});expect(uploaded.status()).toBe(201);const doc=await uploaded.json();
 const download=await request.get(`/api/documents/${doc.id}`);expect(download.status()).toBe(200);expect(download.headers()['content-disposition']).toContain('attachment');expect(await download.body()).toEqual(pdf);
 expect((await request.get('/api/documents/invalid')).status()).toBe(404);
 await page.goto('/bibliotheque');await expect(page.getByRole('heading',{name:'Exercices de construction'})).toBeVisible();await page.getByRole('combobox',{name:'Formation',exact:true}).selectOption('F3');await expect(page.getByRole('heading',{name:'Aucun document ne correspond.'})).toBeVisible();await page.getByRole('combobox',{name:'Formation',exact:true}).selectOption('F4');await page.getByLabel('Rechercher').fill('construction');await expect(page.getByRole('link',{name:'Télécharger le document'})).toBeVisible();
});
