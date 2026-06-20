const fs = require('fs');
let content = fs.readFileSync('pages/blog.html', 'utf8');

// Wrap featured post in a link
content = content.replace(
  `<div class="featured-post reveal">`,
  `<a href="blog-post.html?post=building-from-a-phone" class="featured-post reveal">`
);
content = content.replace(
  `        <span>6 min read</span>\n      </div>\n    </div>\n\n    <span class="section-label">Latest Posts</span>`,
  `        <span>6 min read</span>\n      </div>\n    </a>\n\n    <span class="section-label">Latest Posts</span>`
);

const cards = [
  ['🇳🇬', 'unbanked-nigeria'],
  ['🔐', 'how-flashpay-protects-your-money'],
  ['💰', 'smart-ways-to-save-2026'],
  ['🏆', 'introducing-flashpoints'],
  ['📱', 'tech-stack-powering-flashpay'],
  ['🌍', 'expand-west-africa']
];

cards.forEach(function(c) {
  const emoji = c[0];
  const slug = c[1];
  const oldOpen = `<div class="post-card">\n        <div class="post-image">${emoji}</div>`;
  const newOpen = `<a href="blog-post.html?post=${slug}" class="post-card">\n        <div class="post-image">${emoji}</div>`;
  content = content.split(oldOpen).join(newOpen);
});

// Fix closing tags - each card ends with post-footer div close, then post-content close, then post-card close
content = content.replace(
  /(<div class="post-footer">[^<]*<span>[^<]*<\/span><span>•<\/span><span>[^<]*<\/span><\/div>\s*)<\/div>\s*<\/div>/g,
  '$1</div></a>'
);

fs.writeFileSync('pages/blog.html', content);
console.log('Done!');
console.log('Has article links:', (content.match(/blog-post\.html\?post=/g) || []).length);
