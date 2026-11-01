const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...rest] = line.split('=');
  const val = rest.join('=');
  if (key && val) acc[key.trim()] = val.trim().replace(/^[\"']|[\"']$/g, '');
  return acc;
}, {});

const url = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/pt_registrations';
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    deed_number: 'TEST',
    deed_date: '2026-08-31',
    pt_name: 'Test',
    founders: 'Test'
  })
})
.then(res => res.json())
.then(data => console.log('Fetch Result PT:', data))
.catch(e => console.error(e));
