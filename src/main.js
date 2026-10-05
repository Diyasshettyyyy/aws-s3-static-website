const events = [
  ['Golden Hour Sessions','Music','OCT 12 · 6:30 PM','Riverside Park','Brooklyn, NY','$28','SELLING FAST','photo-1470229722913-7c0e2dbbafd3'],
  ['The Sunday Market','Food & drink','OCT 13 · 10:00 AM','The Foundry','Queens, NY','Free','LOCAL FAVORITE','photo-1441986300917-64674bd600d8'],
  ['Clay After Dark','Art & culture','OCT 16 · 7:00 PM','Morrow Studio','Manhattan, NY','$42','FEW SPOTS LEFT','photo-1565193298595-6c52c4a08430'],
  ['Rooftop Cinema Club','Film','OCT 18 · 8:00 PM','Elsewhere Rooftop','Brooklyn, NY','$18','THIS WEEK','photo-1489599849927-2ee91cede3ba'],
  ['Run Club, No Club','Wellness','OCT 19 · 8:30 AM','McCarren Park','Brooklyn, NY','Free','ALL LEVELS','photo-1530549387789-4c1017266635'],
  ['Jazz in the Courtyard','Music','OCT 20 · 5:00 PM','Wythe Hotel','Brooklyn, NY','$35','NEW','photo-1511192336575-5a79af67a629']
];
const cats=['All events','Music','Food & drink','Art & culture','Film','Wellness'];
let cat=cats[0], saved=[], savedMode=false;
const f=document.querySelector('#filters');
f.innerHTML=cats.map((x,i)=>`<button class="pill ${!i?'active':''}" data-cat="${x}">${x}</button>`).join('');
f.onclick=e=>{if(e.target.dataset.cat){cat=e.target.dataset.cat;f.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));render()}};
document.querySelector('#query').oninput=render;
document.querySelector('#city').onchange=render;
window.showSaved=()=>{savedMode=!savedMode;render();document.querySelector('#discover').scrollIntoView({behavior:'smooth'})};
window.allEvents=()=>{savedMode=false;cat=cats[0];document.querySelector('#query').value='';f.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));render()};
window.toggleSaved=id=>{saved=saved.includes(id)?saved.filter(x=>x!==id):saved.concat(id);document.querySelector('#saved-count').textContent=saved.length;render()};
function render(){
  const q=document.querySelector('#query').value.toLowerCase();
  const list=events.filter(e=>(cat===cats[0]||e[1]===cat)&&(!savedMode||saved.includes(events.indexOf(e)))&&(!q||e.join(' ').toLowerCase().includes(q)));
  document.querySelector('#count').textContent=list.length+' EVENTS FOUND ↗';
  document.querySelector('#events').innerHTML=list.length?list.map(e=>{
    const id=events.indexOf(e);
    return `<article class="card"><div class="photo"><img src="https://images.unsplash.com/${e[7]}?auto=format&fit=crop&w=800&q=85"><label>${e[6]}</label><button class="heart ${saved.includes(id)?'selected':''}" onclick="toggleSaved(${id})">${saved.includes(id)?'♥':'♡'}</button><span>${e[1]}</span></div><small class="date">${e[2]}</small><h3>${e[0]} <button class="arrow" onclick="openBooking(${id})">↗</button></h3><p class="place">⌖ &nbsp;${e[3]} · ${e[4]}</p><div class="price">${e[5]}<button onclick="openBooking(${id})">Request tickets →</button></div></article>`;
  }).join(''):'<div class="empty"><h3>Nothing here just yet.</h3><p>Try another search or explore all events.</p></div>';
}
window.render=render;
window.openBooking=id=>{
  const e=events[id];
  const overlay=document.createElement('div'); overlay.className='eventhub-overlay';
  overlay.innerHTML=`<section class="eventhub-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button class="eventhub-close" type="button" aria-label="Close">×</button><small>EVENTHUB TICKET REQUEST</small><h2 id="booking-title">${e[0]}</h2><p>${e[2]} · ${e[3]}</p><form id="booking-form"><label>Your name<input name="name" required maxlength="100" autocomplete="name"></label><label>Email<input name="email" type="email" required maxlength="254" autocomplete="email"></label><label>Tickets<select name="quantity"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></label><input name="website" class="eventhub-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true"><button type="submit">Send request</button><p class="eventhub-message" role="status"></p></form></section>`;
  document.body.append(overlay);
  const close=()=>overlay.remove(); overlay.querySelector('.eventhub-close').onclick=close; overlay.onclick=ev=>{if(ev.target===overlay)close()};
  overlay.querySelector('form').onsubmit=async ev=>{
    ev.preventDefault(); const form=ev.currentTarget, button=form.querySelector('button[type=submit]'), msg=form.querySelector('.eventhub-message');
    button.disabled=true; msg.textContent='Sending…';
    try { await apiPost('/bookings',{eventId:id,name:form.elements.namedItem('name').value.trim(),email:form.elements.namedItem('email').value.trim(),quantity:Number(form.elements.namedItem('quantity').value),website:form.elements.namedItem('website').value}); msg.textContent='Request received. The organizer will follow up with you.'; form.reset(); }
    catch(error){ msg.textContent=error.message; }
    finally { button.disabled=false; }
  };
  overlay.querySelector('input[name=name]').focus();
};
async function apiPost(path,data){
  const base=window.EVENTHUB_API_URL?.trim();
  if(!base) throw new Error('Online requests are not connected yet. Please try again later.');
  const response=await fetch(`${base.replace(/\/$/,'')}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  let body={}; try{body=await response.json()}catch{}
  if(!response.ok) throw new Error(body.message||'Could not send your request. Please try again.');
  return body;
}
const newsletter=document.querySelector('.newsletter form');
newsletter.onsubmit=async ev=>{
  ev.preventDefault(); const form=ev.currentTarget, input=form.querySelector('input[type=email]'), button=form.querySelector('button');
  let status=form.querySelector('.eventhub-message'); if(!status){status=document.createElement('p');status.className='eventhub-message';status.setAttribute('role','status');form.append(status)}
  button.disabled=true; status.textContent='Signing you up…';
  try{await apiPost('/newsletter',{email:input.value.trim(),website:form.querySelector('[name=website]')?.value||''});status.textContent='You’re on the list. Keep your weekends open. ✳';form.reset()}
  catch(error){status.textContent=error.message}
  finally{button.disabled=false}
};
render();

