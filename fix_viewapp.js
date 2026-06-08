const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find and fix the broken viewApp function
const brokenView = /function viewApp\(i\) \{[\s\S]*?\}/;

const fixedView = `function viewApp(i) {
    var a = applications[i];
    alert('NAME: ' + a.full_name + ' | EMAIL: ' + a.email + ' | PHONE: ' + a.phone + ' | ROLE: ' + a.role + ' | EXPERIENCE: ' + a.experience + ' | SKILLS: ' + a.skills + ' | PORTFOLIO: ' + (a.portfolio || 'N/A') + ' | MOTIVATION: ' + a.motivation);
  }`;

html = html.replace(brokenView, fixedView);
fs.writeFileSync('index.html', html);
console.log('Done!');
