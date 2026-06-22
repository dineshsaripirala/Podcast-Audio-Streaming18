
const ACCOUNT_KEY='stacklyAccount';
const SESSION_KEY='stacklySession';
const roleLabels={client:'Client',admin:'Marketing Manager'};
const dashboardRoutes={client:'client-dashboard.html',admin:'admin-dashboard.html'};

function readStorage(key){
  try{return JSON.parse(localStorage.getItem(key))}catch{return null}
}

function getSession(){
  const session=readStorage(SESSION_KEY);
  return session?.loggedIn&&session.name&&session.email&&dashboardRoutes[session.role]?session:null;
}

const menuBtn=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav-menu');
if(menuBtn&&nav){menuBtn.addEventListener('click',()=>nav.classList.toggle('open'))}

const currentSession=getSession();
const authNavLink=document.querySelector('.nav-menu a[href="signin.html"]');
if(authNavLink&&currentSession){
  authNavLink.textContent='Dashboard';
  authNavLink.href=dashboardRoutes[currentSession.role];
  authNavLink.classList.remove('active');
  document.querySelector('.nav-register')?.remove();
}

document.querySelectorAll('[data-alpha]').forEach(i=>i.addEventListener('input',()=>i.value=i.value.replace(/[^a-zA-Z\s]/g,'')));
document.querySelectorAll('[data-number]').forEach(i=>i.addEventListener('input',()=>i.value=i.value.replace(/[^0-9]/g,'')));

const contact=document.getElementById('contactForm');
if(contact){
  contact.addEventListener('submit',e=>{
    e.preventDefault();
    const email=document.getElementById('contactEmail').value.trim();
    const phone=document.getElementById('contactPhone').value.trim();
    const message=document.getElementById('contactMsg');
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    const validPhone=/^[0-9]{10}$/.test(phone);
    message.classList.remove('success');
    if(!validEmail){message.textContent='Enter a valid email address.';document.getElementById('contactEmail').focus();return}
    if(!validPhone){message.textContent='Phone number must contain exactly 10 digits.';document.getElementById('contactPhone').focus();return}
    message.textContent='Message sent successfully.';
    message.classList.add('success');
    contact.reset();
  });
}

const roleSelect=document.getElementById('roleSelect');
if(roleSelect){
  const trigger=roleSelect.querySelector('.role-select-trigger');
  const roleInput=document.getElementById('loginRole');
  const closeRoleMenu=()=>{roleSelect.classList.remove('open');trigger.setAttribute('aria-expanded','false')};
  trigger.addEventListener('click',()=>{const open=roleSelect.classList.toggle('open');trigger.setAttribute('aria-expanded',String(open))});
  roleSelect.querySelectorAll('[data-role]').forEach(option=>option.addEventListener('click',()=>{
    roleInput.value=option.dataset.role;
    trigger.textContent=option.textContent;
    roleSelect.querySelectorAll('[data-role]').forEach(item=>{item.classList.toggle('selected',item===option);item.setAttribute('aria-selected',String(item===option))});
    closeRoleMenu();
  }));
  document.addEventListener('click',e=>{if(!roleSelect.contains(e.target))closeRoleMenu()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeRoleMenu()});
}

const signin=document.getElementById('signinForm');
if(signin){
  const savedAccount=readStorage(ACCOUNT_KEY);
  if(savedAccount?.email){document.getElementById('loginEmail').value=savedAccount.email}
  signin.addEventListener('submit',e=>{
    e.preventDefault();
    const email=document.getElementById('loginEmail').value.trim().toLowerCase();
    const password=document.getElementById('loginPassword').value;
    const role=document.getElementById('loginRole').value;
    const account=readStorage(ACCOUNT_KEY);
    const message=document.getElementById('loginMsg');
    if(!email){message.textContent='Please enter a valid Email ID.';return}
    if(password.length<6){message.textContent='Password must contain at least 6 characters.';return}
    if(!dashboardRoutes[role]){message.textContent='Please select a role.';return}
    const emailName=email.split('@')[0].replace(/[._-]+/g,' ').replace(/\b\w/g,char=>char.toUpperCase());
    const name=account?.email===email?account.name:(emailName||'STACKLY User');
    const session={loggedIn:true,name,email,role};
    localStorage.setItem(SESSION_KEY,JSON.stringify(session));
    localStorage.removeItem('stacklyLogin');
    location.href=dashboardRoutes[role];
  });
}

const reg=document.getElementById('registerForm');
if(reg){
  reg.addEventListener('submit',e=>{
    e.preventDefault();
    const name=document.getElementById('regName').value.trim();
    const email=document.getElementById('regEmail').value.trim().toLowerCase();
    const phone=document.getElementById('regPhone').value.trim();
    const password=document.getElementById('regPass').value;
    const confirmPassword=document.getElementById('regConfirm').value;
    const message=document.getElementById('regMsg');
    if(!name||!email||!phone){message.textContent='Please complete all account details.';return}
    if(password.length<6){message.textContent='Password must contain at least 6 characters.';return}
    if(password!==confirmPassword){message.textContent='Password and Confirm Password must match.';return}
    localStorage.setItem(ACCOUNT_KEY,JSON.stringify({name,email,phone,password}));
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('stacklyLogin');
    message.textContent='Account created successfully. Redirecting to sign in…';
    setTimeout(()=>location.href='signin.html',900);
  });
}

const dashboardContent=document.getElementById('dashContent');
const dashboardMode=dashboardContent?.dataset.dashboard;
let dashboardAuthorized=false;
if(dashboardMode){
  const session=getSession();
  if(!session){
    location.replace('signin.html');
  }else if(session.role!==dashboardMode){
    location.replace(dashboardRoutes[session.role]);
  }else{
    dashboardAuthorized=true;
    const roleLabel=roleLabels[session.role];
    document.querySelectorAll('[data-user-name]').forEach(el=>el.textContent=session.name);
    document.querySelectorAll('[data-user-email]').forEach(el=>el.textContent=session.email);
    document.querySelectorAll('[data-user-role]').forEach(el=>el.textContent=roleLabel);
    document.querySelectorAll('[data-user-initial]').forEach(el=>el.textContent=session.name.charAt(0).toUpperCase());
  }
}
const clientPanels={
Overview:['Listener Overview','Your listening performance, subscribed podcasts, saved episodes, recent plays, and weekly activity are summarized here.','<div class="dash-grid"><div class="dash-card"><span>Saved Podcasts</span><strong>36</strong></div><div class="dash-card"><span>Hours Listened</span><strong>128</strong></div><div class="dash-card"><span>Subscriptions</span><strong>18</strong></div><div class="dash-card"><span>New Alerts</span><strong>12</strong></div></div>'],
Podcasts:['Subscribed Podcasts','Manage your favorite shows, followed creators, and recommended podcast collections.','<div class="dash-list"><div>Founder Frequency • New episode available</div><div>Market Mic • Weekly business update</div><div>Wellness Waves • Saved for later</div></div>'],
Episodes:['Saved & Recent Episodes','View recently played episodes, continue listening, and manage your saved queue.','<table class="table"><tr><th>Episode</th><th>Duration</th><th>Status</th></tr><tr><td>Audio Ads That Convert</td><td>28 min</td><td><span class="badge">Saved</span></td></tr><tr><td>Future of Streaming</td><td>45 min</td><td><span class="badge">Playing</span></td></tr></table>'],
Analytics:['Listening Analytics','Analyze your listening habits, completion rate, preferred categories, and weekly activity.','<div class="line-chart"><span></span><span></span><span></span><span></span><span></span></div>'],
Listeners:['Community Insights','See listener groups, creator communities, and audience trends around your subscribed shows.','<div class="dash-grid"><div class="dash-card"><span>Community Rank</span><strong>Top 8%</strong></div><div class="dash-card"><span>Reviews Added</span><strong>24</strong></div></div>'],
Reports:['Personal Reports','Download monthly listening reports and saved content summaries.','<div class="dash-list"><div>May Listening Report</div><div>Top Categories Report</div><div>Saved Episodes Export</div></div>'],
Messages:['Messages','Creator updates, platform notifications, and support replies appear here.','<div class="dash-list"><div>STACKLY Support: Your report is ready.</div><div>Founder Frequency: New bonus episode released.</div></div>'],
Settings:['Account Settings','Manage profile preferences, notifications, privacy, and playback settings.','<div class="dash-list"><div>Email Notifications: Enabled</div><div>Autoplay: Enabled</div><div>Theme: Navy Blue</div></div>']
};
const adminPanels={
Overview:['Manager Overview','Monitor podcast performance, campaign results, revenue, listener growth, and team updates.','<div class="dash-grid"><div class="dash-card"><span>Active Shows</span><strong>84</strong></div><div class="dash-card"><span>Uploads</span><strong>312</strong></div><div class="dash-card"><span>Campaigns</span><strong>27</strong></div><div class="dash-card"><span>Revenue</span><strong>₹18.4L</strong></div></div>'],
Podcasts:['Podcast Management','Create, update, publish, and organize podcast collections for different categories.','<table class="table"><tr><th>Show</th><th>Category</th><th>Status</th></tr><tr><td>Founder Frequency</td><td>Business</td><td><span class="badge">Live</span></td></tr><tr><td>Health Audio Lab</td><td>Health</td><td><span class="badge">Scheduled</span></td></tr></table>'],
Episodes:['Episode Uploads','Manage episode titles, duration, upload status, thumbnails, and publishing schedule.','<div class="dash-list"><div>Upload: Future of Streaming • Ready</div><div>Edit: Audio Ads That Convert • Draft</div><div>Schedule: Wellness Waves • Tomorrow</div></div>'],
Analytics:['Platform Analytics','Track listening trends, completion rate, retention, category performance, and listener growth.','<div class="line-chart"><span></span><span></span><span></span><span></span><span></span></div>'],
Listeners:['Listener Growth','Review audience segments, repeat listeners, new subscribers, and engagement quality.','<div class="dash-grid"><div class="dash-card"><span>New Listeners</span><strong>18.2K</strong></div><div class="dash-card"><span>Retention</span><strong>72%</strong></div></div>'],
Revenue:['Revenue Metrics','Analyze subscription revenue, sponsorship income, audio ad earnings, and monthly growth.','<div class="dash-grid"><div class="dash-card"><span>MRR</span><strong>₹7.8L</strong></div><div class="dash-card"><span>Ad Revenue</span><strong>₹4.2L</strong></div><div class="dash-card"><span>Sponsors</span><strong>19</strong></div></div>'],
Reports:['Reports','Generate performance reports for episodes, campaigns, revenue, and listener analytics.','<div class="dash-list"><div>Campaign ROI Report</div><div>Episode Performance Report</div><div>Revenue Forecast Report</div></div>'],
Messages:['Messages','View creator messages, client requests, support tickets, and internal notes.','<div class="dash-list"><div>Client: Need campaign report</div><div>Creator: Episode upload completed</div><div>Support: Map issue fixed</div></div>'],
Settings:['Platform Settings','Manage dashboard preferences, team roles, notification rules, and publishing controls.','<div class="dash-list"><div>Team Access: 6 managers</div><div>Auto Reports: Enabled</div><div>Brand Theme: Navy Blue</div></div>']
};
if(dashboardAuthorized){
  document.querySelectorAll('.sidebar button[data-panel]').forEach(btn=>btn.addEventListener('click',()=>{
    if(btn.dataset.panel==='sign-out'){
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('stacklyLogin');
      location.replace('signin.html');
      return;
    }
    const name=btn.textContent.trim();
    const data=(dashboardMode==='admin'?adminPanels:clientPanels)[name];
    if(data){dashboardContent.innerHTML=`<div class="panel"><h2>${data[0]}</h2><p>${data[1]}</p>${data[2]}</div>`}
  }));
}
