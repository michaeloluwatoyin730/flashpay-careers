const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix broken quote in changeStatus calls
html = html.replace(
  "rows += '<button class=\"action-btn btn-approve\" onclick=\"changeStatus('' + a.id + '', 'approved')\">✓</button> ';",
  "rows += '<button class=\"action-btn btn-approve\" onclick=\"changeStatus(\\'' + a.id + '\\', \\'approved\\')\">✓</button> ';"
);

html = html.replace(
  "rows += '<button class=\"action-btn btn-reject\" onclick=\"changeStatus('' + a.id + '', 'rejected')\">✗</button>';",
  "rows += '<button class=\"action-btn btn-reject\" onclick=\"changeStatus(\\'' + a.id + '\\', \\'rejected\\')\">✗</button>';"
);

fs.writeFileSync('index.html', html);
console.log('Done!');
