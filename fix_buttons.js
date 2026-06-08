const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix updateAppStatus function to accept id and status directly
html = html.replace(
  'async function updateAppStatus(id,status){',
  'async function updateAppStatus(id,status){'
);

// Replace the entire renderApplications tbody with fixed version
const oldTbody = html.match(/tbody\.innerHTML=applications\.map[\s\S]*?\.join\(""\);/);
if (oldTbody) {
  const newTbody = `tbody.innerHTML=applications.map(function(a,i){
    var id = a.id;
    var row = '<tr>';
    row += '<td>'+(i+1)+'</td>';
    row += '<td><strong>'+a.full_name+'</strong><br><small>'+a.email+'</small></td>';
    row += '<td>'+a.role+'</td>';
    row += '<td>'+a.experience+'</td>';
    row += '<td>'+new Date(a.created_at).toLocaleDateString()+'</td>';
    row += '<td><span class="status-badge status-'+a.status+'">'+a.status+'</span></td>';
    row += '<td>';
    row += '<button class="action-btn btn-view" onclick="viewApp('+i+')">View</button> ';
    row += '<button class="action-btn btn-approve" onclick="doApprove(\''+id+'\')">✓</button> ';
    row += '<button class="action-btn btn-reject" onclick="doReject(\''+id+'\')">✗</button>';
    row += '</td></tr>';
    return row;
  }).join('');`;
  html = html.replace(oldTbody[0], newTbody);
}

// Add helper functions before updateAppStatus
html = html.replace(
  'async function updateAppStatus(id,status){',
  `function doApprove(id){ updateAppStatus(id,'approved'); }
function doReject(id){ updateAppStatus(id,'rejected'); }
async function updateAppStatus(id,status){`
);

fs.writeFileSync('index.html', html);
console.log('Done!');
