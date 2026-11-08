(function(){
var API='https://oetparthway--ece311aecdf411f1b8951607ee4eb77e.web.val.run';
function $(i){return document.getElementById(i)}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function tok(){try{return localStorage.getItem('studentToken')||''}catch(e){return ''}}
function setTok(t){try{if(t)localStorage.setItem('studentToken',t);else localStorage.removeItem('studentToken')}catch(e){}}
var tt;
function toast(m,bad){var t=$('lcToast');if(!t){t=el('div','toast');t.id='lcToast';document.body.appendChild(t)}t.textContent=m;t.className='toast show'+(bad?' bad':'');clearTimeout(tt);tt=setTimeout(function(){t.className='toast'+(bad?' bad':'')},3600)}
function call(path,method,body){
  var h={'Content-Type':'application/json'};if(tok())h['Authorization']='Bearer '+tok();
  return fetch(API+path,{method:method,headers:h,body:body?JSON.stringify(body):undefined}).then(function(r){return r.json().catch(function(){return {ok:false,error:'Unexpected reply. Try again.'}}).then(function(j){j._s=r.status;return j})}).catch(function(){return {ok:false,error:'No connection. Check your internet and try again.'}})
}
function modal(build){var m=el('div','mdl'),b=el('div','mbox');m.appendChild(b);document.body.appendChild(m);var close=function(){if(m.parentNode)m.parentNode.removeChild(m)};build(b,close);return close}
function info(title,text,btn,cb){modal(function(b,close){b.appendChild(el('h3',null,title));b.appendChild(el('p',null,text));var o=el('button','btn',btn||'OK');o.onclick=function(){close();if(cb)cb()};b.appendChild(o)})}
var page=document.body.getAttribute('data-page')||'';
var base=(function(){var s=document.currentScript;return s&&s.src?s.src.replace(/site[.]js([?].*)?$/,''):'/'})();
var MEP=null;function me(){return MEP||(MEP=call('/wiki/me','GET'))}
(function acct(){
  if(!tok())return;var h=document.querySelector('header.top');if(!h)return;
  me().then(function(j){if(!j||!j.ok||!j.profile)return;var d=el('div','acct');d.appendChild(el('b',null,j.profile.name||'Your account'));d.appendChild(document.createTextNode(' · '+(j.published||0)+(j.published===1?' post published':' posts published')));var ml=el('a',null,'My posts');ml.href=base+'myposts.html';ml.style.cssText='margin-left:12px;text-decoration:underline;color:var(--blue);font-weight:600';d.appendChild(ml);h.parentNode.insertBefore(d,h.nextSibling)})
})();
document.addEventListener('click',function(e){var b=e.target.closest?e.target.closest('[data-copy]'):null;if(!b)return;var u=b.getAttribute('data-copy');
  var ok=function(){toast('Link copied')};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(ok,function(){window.prompt('Copy this link',u)})}else{window.prompt('Copy this link',u)}});
(function nav(){
  var links=document.querySelectorAll('.nv a');
  for(var i=0;i<links.length;i++){if(links[i].getAttribute('data-p')===page)links[i].className='on'}
  var l=$('nvl');
  if(l&&tok()){l.textContent='Log out';l.removeAttribute('href');l.style.cursor='pointer';l.onclick=function(e){e.preventDefault();call('/logout','POST').then(function(){});setTok('');try{localStorage.removeItem('lcDraft')}catch(x){}location.href=base+'login.html'}}
})();
function nextOk(){var m=/[?&]next=([^&]+)/.exec(location.search),v=m?decodeURIComponent(m[1]):'';return v==='write.html'||v==='myposts.html'?v:''}
document.addEventListener('click',function(e){var b=e.target.closest?e.target.closest('[data-corr]'):null;if(!b)return;
  if(!tok()){info('Log in to suggest a correction','You need to be logged in to send a correction.','Log in',function(){location.href=base+'login.html'});return}
  var id=b.getAttribute('data-corr');
  modal(function(m,close){m.appendChild(el('h3',null,'Suggest a correction'));m.appendChild(el('p',null,'Say what is wrong and what it should say. The Law Companion team will review it.'));
    var ta=el('textarea');ta.rows=5;ta.maxLength=500;m.appendChild(ta);var row=el('div','row'),s=el('button','btn','Send'),c=el('button','btn alt','Cancel');c.onclick=close;
    s.onclick=function(){s.disabled=true;call('/wiki/correction','POST',{id:id,note:ta.value}).then(function(j){s.disabled=false;if(j.login||j._s===401){setTok('');close();toast('Please log in again.',true);return}if(!j.ok){toast(j.error||'Could not send.',true);return}close();toast('Thank you. Your suggestion was sent.')})};
    row.appendChild(s);row.appendChild(c);m.appendChild(row)})});
function slug(a){var s=String(a.title||'post').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60).replace(/-+$/,'')||'post';return s+'-'+String(a.id).slice(0,8)}
if(page==='myposts'){
  var ML=$('mpList'),MG=$('mpGate');
  if(ML){if(!tok()){MG.hidden=false}else{
    call('/wiki/mine','GET').then(function(j){
      if(j.login||j._s===401){setTok('');MG.hidden=false;return}
      if(!j.ok){toast(j.error||'Could not load your posts.',true);return}
      var it=j.items||[];if(!it.length){ML.appendChild(el('p','lead','You have no posts yet. Press Write to start one.'));return}
      var LB={draft:['Draft',''],pending:['In review','p'],published:['Gazetted','g'],rejected:['Not accepted','r'],unpublished:['Taken down','r']};
      it.forEach(function(a){var c=el('div','mp'),lb=LB[a.status]||[a.status,''];
        c.appendChild(el('span','stt '+lb[1],lb[0]));c.appendChild(el('b',null,a.title||'Untitled'));
        var dt=new Date(a.updated_at);c.appendChild(el('small',null,(a.kind==='wiki'?'Law Wiki':'Magazine')+(isNaN(dt)?'':' · '+dt.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}))));
        if(a.status==='rejected'&&a.reject_reason)c.appendChild(el('div','why','Reason: '+a.reject_reason));
        if(a.status==='draft')c.appendChild(el('p','hint','Drafts are kept for 7 days from the last save, then deleted.'));
        if(a.status==='pending')c.appendChild(el('p','hint','We aim to review within 48 hours. A post not reviewed within 7 days is declined and removed.'));
        if(a.status==='published'){var ln=el('a',null,'View on the site ↗');ln.href=base+'posts/'+slug(a)+'.html';ln.style.cssText='display:inline-block;margin-top:8px;color:var(--blue);font-weight:600';c.appendChild(ln)}
        ML.appendChild(c)})})}}
}

if(page==='login'){
  var f=$('lf');if(!f)return;
  if(tok()){info('You are logged in','Open the writing page to start a post.','Write',function(){location.href=base+'write.html'})}
  f.onsubmit=function(e){e.preventDefault();var b=$('lb');b.disabled=true;b.textContent='Logging in...';
    call('/login','POST',{email:$('le').value.trim(),password:$('lp').value}).then(function(j){
      b.disabled=false;b.textContent='Log in';
      if(!j.ok||!j.token){toast(j.error||'Could not log in.',true);return}
      setTok(j.token);location.href=base+(nextOk()||'write.html')})};
}

if(page==='write'){
  var G=$('wGate'),BI=$('wBio'),ED=$('wEd');if(!G)return;
  var tags=[];
  var show=function(w){G.hidden=w!=='g';BI.hidden=w!=='b';ED.hidden=w!=='e'};
  if(!tok()){show('g')}else{
    me().then(function(j){
      if(j.login||j._s===401){setTok('');show('g');return}
      if(!j.ok){toast(j.error||'Could not load your account.',true);show('g');return}
      var p=j.profile||{};$('bnm').textContent=(p.name||'Your name')+(p.institution?' - '+p.institution:'');
      if(j.bio){show('e')}else{show('b')}
    })
  }
  $('bgo').onclick=function(){var bio=$('btx').value.trim(),lk=$('blk').value.trim();
    if(bio.length<10){toast('Write a short bio (at least 10 letters).',true);return}
    if(lk&&!/^https:[/][/](www[.]|m[.]|web[.])?(linkedin[.]com|facebook[.]com|fb[.]com|fb[.]me)[/]/i.test(lk)){toast('The link must be a LinkedIn or Facebook page starting with https://, or leave it empty.',true);return}
    $('bgo').disabled=true;
    call('/wiki/bio','POST',{bio:bio,link:lk}).then(function(j){$('bgo').disabled=false;if(!j.ok){toast(j.error||'Could not save.',true);return}toast('Bio saved');show('e')})};
  $('btx').oninput=function(){$('bct').textContent=$('btx').value.length+'/150'};

  var E=$('ebody'),T=$('etitle'),TG=$('etags');
  function words(){var t=(E.innerText||'').replace(/\s+/g,' ').trim();return t?t.split(' ').length:0}
  function count(){$('ewc').textContent=words()+' words (min 100)';save()}
  function ck(){var m={t:T.value.trim().length>=5,w:words()>=100,c:!!$('ecat').value,m:$('etm').checked},l=document.querySelectorAll('#eck li');for(var q=0;q<l.length;q++){l[q].className=m[l[q].getAttribute('data-k')]?'ok':''}}
  function save(){try{localStorage.setItem('lcDraft',JSON.stringify({t:T.value,g:TG.value,c:$('ecat').value,b:E.innerHTML,k:$('ekind').value}));var n=new Date();$('esv').textContent='Draft saved '+('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2)}catch(e){}ck()}
  try{var d=JSON.parse(localStorage.getItem('lcDraft')||'null');if(d){T.value=d.t||'';TG.value=d.g||'';E.innerHTML=cleanH(d.b||'');if(d.k)$('ekind').value=d.k;if(d.c)$('ecat').value=d.c}}catch(e){}
  function cleanH(h){var D=document.createElement('div');D.innerHTML=h;var ok={P:1,H2:1,H3:1,H4:1,BLOCKQUOTE:1,UL:1,OL:1,LI:1,B:1,STRONG:1,I:1,EM:1,U:1,S:1,STRIKE:1,BR:1};
    (function w(n){var c=[].slice.call(n.childNodes);c.forEach(function(x){if(x.nodeType===1){if(!ok[x.tagName]){if(/^(SCRIPT|STYLE|IFRAME|OBJECT|IMG)$/.test(x.tagName)){n.removeChild(x);return}w(x);while(x.firstChild)n.insertBefore(x.firstChild,x);n.removeChild(x)}else{while(x.attributes.length)x.removeAttribute(x.attributes[0].name);w(x)}}else if(x.nodeType!==3)n.removeChild(x)})})(D);return D.innerHTML}
  E.addEventListener('paste',function(e){e.preventDefault();var t=(e.clipboardData||window.clipboardData).getData('text/plain');document.execCommand('insertText',false,t)});
  E.addEventListener('input',count);T.addEventListener('input',save);TG.addEventListener('input',save);$('ekind').onchange=save;$('ecat').onchange=save;$('etm').addEventListener('change',ck);
  var cmds=document.querySelectorAll('[data-c]');
  for(var i=0;i<cmds.length;i++){(function(b){b.onmousedown=function(e){e.preventDefault()};b.onclick=function(){E.focus();document.execCommand(b.getAttribute('data-c'),false,null);count()}})(cmds[i])}
  $('eblk').onchange=function(){E.focus();document.execCommand('formatBlock',false,$('eblk').value);count()};
  count();

  function body(){return cleanH(E.innerHTML)}
  function tagList(){var k=TG.value.split(',').map(function(x){return x.trim()}).filter(Boolean).slice(0,5);return $('ecat').value?[$('ecat').value].concat(k):k}
  function check(){
    if(T.value.trim().length<5){toast('Give the post a title of at least 5 letters.',true);return false}
    if(words()<100){toast('A post needs at least 100 words. You have '+words()+'.',true);return false}
    if(!$('ecat').value){toast('Choose a category for your post.',true);return false}
    return true}
  var curId='';try{curId=localStorage.getItem('lcDraftId')||''}catch(e){}
  function setId(v){curId=v||'';try{if(curId)localStorage.setItem('lcDraftId',curId);else localStorage.removeItem('lcDraftId')}catch(e){}}
  function payload(sub){return {id:curId||undefined,kind:$('ekind').value,title:T.value.trim(),tags:tagList(),body:body(),submit:sub,accept:sub?true:undefined}}
  function done(sub){
    if(sub){try{localStorage.removeItem('lcDraft')}catch(e){}setId('');
      T.value='';TG.value='';E.innerHTML='';$('ecat').value='';$('etm').checked=false;count();
      info('Sent for review','Your post is with the Law Companion team. We aim to review within 48 hours. When it is gazetted you will get a message in the app with its link. You can follow its status under My posts.','See my posts',function(){location.href=base+'myposts.html'})}
    else toast('Draft saved. Drafts are kept for 7 days.')}
  $('esave').onclick=function(){if(T.value.trim().length<1){toast('Add a title first.',true);return}
    call('/wiki/save','POST',payload(false)).then(function(j){if(j.login||j._s===401){setTok('');toast('Please log in again.',true);setTimeout(function(){location.href=base+'login.html?next=write.html'},900);return}if(!j.ok){toast(j.error||'Could not save.',true);return}if(j.id)setId(j.id);done(false)})};
  function fixBox(j){return new Promise(function(res){modal(function(b,close){
    b.appendChild(el('h3',null,'This post needs changes'));if(j.summary)b.appendChild(el('p',null,j.summary));
    (j.flags||[]).forEach(function(f){var d=el('div','fl'),h=el('b',null,f.type||'Issue');h.appendChild(el('em',null,f.kind==='fact'?'Fact check':f.kind==='platform'?'Platform':'Policy'));d.appendChild(h);
      if(f.quote)d.appendChild(el('q',null,f.quote));if(f.why)d.appendChild(el('p',null,f.why));
      if(f.suggestion){var p=el('p');p.appendChild(el('b',null,'Suggestion: '));p.appendChild(document.createTextNode(f.suggestion));d.appendChild(p)}b.appendChild(d)});
    var row=el('div','row'),ed=el('button','btn','Edit post');ed.onclick=function(){close();res(false)};row.appendChild(ed);b.appendChild(row);
    if(j.appealable){var ap=el('button','btn alt','Appeal'),box=el('div');box.hidden=true;box.style.marginTop='12px';
      var ta=el('textarea');ta.rows=3;ta.maxLength=600;ta.placeholder='Why is this allowed? For example, it reports the facts of a case.';
      var go=el('button','btn','Send appeal');go.style.marginTop='8px';
      go.onclick=function(){go.disabled=true;call('/wiki/appeal','POST',{title:T.value.trim(),body:body(),reason:ta.value}).then(function(a){go.disabled=false;if(!a.ok){toast(a.error||'Could not send the appeal.',true);return}close();res(true)})};
      box.appendChild(ta);box.appendChild(go);ap.onclick=function(){box.hidden=false;ap.hidden=true;ta.focus()};row.appendChild(ap);b.appendChild(box)}
    else b.appendChild(el('p',null,'This cannot be appealed. Please rewrite the marked parts.'))})})}
  $('esub').onclick=function(){
    if(!check())return;if(!$('etm').checked){toast('Please tick the box to accept the terms.',true);return}
    var btn=$('esub');btn.disabled=true;btn.textContent='Checking...';
    var reset=function(){btn.disabled=false;btn.textContent='Submit for review'};
    call('/wiki/precheck','POST',{title:T.value.trim(),body:body(),tags:tagList()}).then(function(j){
      if(j.login||j._s===401){reset();setTok('');toast('Please log in again.',true);setTimeout(function(){location.href=base+'login.html?next=write.html'},900);return}
      if(!j.ok){reset();toast(j.error||'Could not check your post. Try again.',true);return}
      var go=(j.verdict!=='fix'||j.appealed)?Promise.resolve(true):fixBox(j);
      go.then(function(ok){if(!ok){reset();return}
        call('/wiki/save','POST',payload(true)).then(function(r){reset();
          if(!r.ok){toast(r.error||'Could not submit.',true);return}done(true)})})})};
}
})();