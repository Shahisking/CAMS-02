const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') && f !== 'auth.js');

for (const file of files) {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Convert (req, res) to async (req, res) if they contain getDB
  content = content.replace(/router\.(get|post|put|delete)\(['"](.*?)['"],\s*\(req,\s*res\)\s*=>\s*\{/g, 'router.$1(\'$2\', async (req, res) => {');

  // Convert .prepare('...').all([...])
  content = content.replace(/getDB\(\)\.prepare\(([`'"])(.*?)([`'"])\)\.all\((.*?)\)/g, (match, q1, query, q3, args) => {
    let newQuery = query;
    let index = 1;
    newQuery = newQuery.replace(/\?/g, () => `$${index++}`);
    return `(await getDB().query(${q1}${newQuery}${q3}, ${args})).rows`;
  });

  // Convert .prepare('...').all() without args
  content = content.replace(/getDB\(\)\.prepare\(([`'"])(.*?)([`'"])\)\.all\(\)/g, (match, q1, query, q3) => {
    return `(await getDB().query(${q1}${query}${q3})).rows`;
  });

  // Convert getDB().run('...', [...])
  content = content.replace(/getDB\(\)\.run\(([`'"])([\s\S]*?)([`'"]),\s*(\[.*?\])\)/g, (match, q1, query, q3, args) => {
    let newQuery = query;
    let index = 1;
    newQuery = newQuery.replace(/\?/g, () => `$${index++}`);
    return `await getDB().query(${q1}${newQuery}${q3}, ${args})`;
  });

  // Convert getDB().run('...') without args
  content = content.replace(/getDB\(\)\.run\(([`'"])(.*?)([`'"])\)/g, (match, q1, query, q3) => {
    return `await getDB().query(${q1}${query}${q3})`;
  });

  // Specifically for assets.js dynamic update query
  if (file === 'assets.js' || file === 'users.js') {
    content = content.replace(/fields\.push\(\`\$\{fieldMapping\[key\]\} = \?\`\);/g, 'fields.push(`${fieldMapping[key]} = $${fields.length + 1}`);');
    content = content.replace(/fields\.join\(\', \'\)\} WHERE id = \?/g, 'fields.join(\', \')} WHERE id = $${fields.length + 1}');
  }

  // users.js might have a similar update logic
  if (file === 'users.js') {
    content = content.replace(/fields\.push\(\`\$\{fieldMapping\[key\]\} = \?\`\);/g, 'fields.push(`${fieldMapping[key]} = $${fields.length + 1}`);');
    content = content.replace(/fields\.join\(\', \'\)\} WHERE email = \?/g, 'fields.join(\', \')} WHERE email = $${fields.length + 1}');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Migrated ${file}`);
}
