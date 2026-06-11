const fs = require('fs');

const paths = [
    'components/WhatsAppButton.tsx',
    'components/ProductCard.tsx',
    'components/Navbar.tsx',
    'components/Footer.tsx',
    'components/CartDrawer.tsx',
    'app/track/page.tsx',
    'app/shop/[slug]/page.tsx',
    'app/shop/page.tsx',
    'app/contact/page.tsx',
    'app/checkout/page.tsx',
    'app/about/page.tsx'
];

let allCss = '\n/* EXTRA EXTRACTED CSS */\n';

paths.forEach(p => {
    try {
        let content = fs.readFileSync(p, 'utf8');
        const regex = /<style jsx>\{`([\s\S]*?)`\}<\/style>/;
        const match = content.match(regex);
        if (match) {
            allCss += `\n/* from ${p} */\n`;
            allCss += match[1] + '\n';
            content = content.replace(regex, '');
            fs.writeFileSync(p, content);
            console.log('Stripped from ' + p);
        }
    } catch(err) {
        console.error('Failed processing ' + p, err.message);
    }
});

fs.appendFileSync('app/globals.css', allCss);
console.log('Appended to globals.css');
