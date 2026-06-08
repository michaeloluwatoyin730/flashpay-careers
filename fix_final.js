const fs = require('fs');
const env = require('dotenv').config({path: '../flashpay/.env'}).parsed;
const key = env.SUPABASE_KEY;
const url = env.SUPABASE_URL;

let html = fs.readFileSync('index.html', 'utf8');

// Find and replace entire script content
const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');

const newScript = `
  // SUPABASE CONFIG
  const SUPABASE_URL = '${url}';
  const SUPABASE_KEY = '${key}';
  const ADMIN_PASSWORD = 'flashpay2026admin';
  let isAdminAuthenticated = false;
  let applications = [];

  // SCROLL REVEAL
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function() { entry.target.classList.add('visible'); }, i * 80);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(function(el) { observer.observe(el); });

  // ROLES FILTER
  function filterRoles(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    document.querySelectorAll('.role-card').forEach(function(card) {
      card.style.display = (category === 'all' || card.dataset.category === category) ? 'flex' : 'none';
    });
  }

  // FILE LABEL
  function updateFileLabel(input) {
    if (input.files && input.files[0]) {
      document.getElementById('fileLabel').textContent = 'Selected: ' + input.files[0].name;
    }
  }

  // SUPABASE REQUEST
  async function supabaseRequest(method, endpoint, body) {
    var options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'return=minimal'
      }
    };
    if (body) options.body = JSON.stringify(body);
    var res = await fetch(SUPABASE_URL + '/rest/v1/' + endpoint, options);
    if (method === 'POST' || method === 'PATCH') return res.ok;
    return res.json();
  }

  // FETCH APPLICATIONS
  async function fetchApplications() {
    try {
      var data = await supabaseRequest('GET', 'job_applications?order=created_at.desc&select=*');
      applications = data || [];
      renderApplications();
      updateAdminStats();
    } catch(err) {
      console.log('Fetch error:', err);
    }
  }

  // UPDATE STATS
  function updateAdminStats() {
    document.getElementById('totalApps').textContent = applications.length;
    document.getElementById('newApps').textContent = applications.filter(function(a) { return a.status === 'new'; }).length;
    document.getElementById('approvedApps').textContent = applications.filter(function(a) { return a.status === 'approved'; }).length;
    document.getElementById('rejectedApps').textContent = applications.filter(function(a) { return a.status === 'rejected'; }).length;
  }

  // ADMIN LOGIN
  function adminLogin() {
    var p = prompt('Enter admin password:');
    if (p === ADMIN_PASSWORD) {
      isAdminAuthenticated = true;
      fetchApplications();
      showToast('Admin access granted!');
    } else {
      showToast('Incorrect password!');
    }
  }

  // RENDER APPLICATIONS
  function renderApplications() {
    var tbody = document.getElementById('applicationsTable');
    if (!isAdminAuthenticated) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px"><p style="color:#aaa;margin-bottom:12px">Admin access required to view applications</p><button onclick="adminLogin()" style="background:#C8972A;color:#1A3C2E;border:none;padding:10px 24px;border-radius:100px;font-weight:700;cursor:pointer;font-size:14px">Login as Admin</button></td></tr>';
      updateAdminStats();
      return;
    }
    if (!applications.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#aaa;padding:40px">No applications yet.</td></tr>';
      updateAdminStats();
      return;
    }
    var rows = '';
    for (var i = 0; i < applications.length; i++) {
      var a = applications[i];
      rows += '<tr>';
      rows += '<td>' + (i+1) + '</td>';
      rows += '<td><strong>' + a.full_name + '</strong><br><small>' + a.email + '</small></td>';
      rows += '<td>' + a.role + '</td>';
      rows += '<td>' + a.experience + '</td>';
      rows += '<td>' + new Date(a.created_at).toLocaleDateString() + '</td>';
      rows += '<td><span class="status-badge status-' + a.status + '">' + a.status + '</span></td>';
      rows += '<td>';
      rows += '<button class="action-btn btn-view" onclick="viewApp(' + i + ')">View</button> ';
      rows += '<button class="action-btn btn-approve" onclick="changeStatus(\'' + a.id + '\', \'approved\')">✓</button> ';
      rows += '<button class="action-btn btn-reject" onclick="changeStatus(\'' + a.id + '\', \'rejected\')">✗</button>';
      rows += '</td></tr>';
    }
    tbody.innerHTML = rows;
    updateAdminStats();
  }

  // CHANGE STATUS
  async function changeStatus(id, status) {
    try {
      var ok = await supabaseRequest('PATCH', 'job_applications?id=eq.' + id, { status: status });
      if (ok) {
        showToast('Application ' + (status === 'approved' ? 'approved!' : 'rejected!'));
        fetchApplications();
      } else {
        showToast('Could not update. Try again.');
      }
    } catch(err) {
      showToast('Error updating status.');
    }
  }

  // VIEW APPLICATION
  function viewApp(i) {
    var a = applications[i];
    alert(
      'NAME: ' + a.full_name +
      '\nEMAIL: ' + a.email +
      '\nPHONE: ' + a.phone +
      '\nROLE: ' + a.role +
      '\nEXPERIENCE: ' + a.experience +
      '\nSKILLS: ' + a.skills +
      '\nPORTFOLIO: ' + (a.portfolio || 'N/A') +
      '\n\nMOTIVATION:\n' + a.motivation
    );
  }

  // SUBMIT APPLICATION
  async function submitApplication(e) {
    e.preventDefault();
    var btn = document.querySelector('.submit-btn');
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    var app = {
      full_name: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      role: document.getElementById('role').value,
      skills: document.getElementById('skills').value,
      experience: document.getElementById('experience').value,
      portfolio: document.getElementById('portfolio').value,
      motivation: document.getElementById('motivation').value,
      status: 'new'
    };

    try {
      var ok = await supabaseRequest('POST', 'job_applications', app);
      if (ok) {
        document.getElementById('applicationForm').reset();
        document.getElementById('fileLabel').textContent = 'Click to upload your CV';
        showToast('Application submitted! We will be in touch within 5 working days.');
        if (isAdminAuthenticated) fetchApplications();
      } else {
        showToast('Submission failed. Please try again.');
      }
    } catch(err) {
      showToast('Submission failed. Please try again.');
    }

    btn.textContent = 'Submit Application';
    btn.disabled = false;
  }

  // SHOW TOAST
  function showToast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 4000);
  }

  // INIT
  renderApplications();
  updateAdminStats();
`;

var newHtml = html.substring(0, scriptStart + 8) + newScript + '\n</script>\n</body>\n</html>';
fs.writeFileSync('index.html', newHtml);
console.log('Done! Size:', newHtml.length);
