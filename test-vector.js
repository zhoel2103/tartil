const fetch = require('node-fetch'); // we can just use global fetch

async function test() {
  try {
    const res = await fetch('https://equran.id/api/vector', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'ayat tentang sabar',
        cari: 'ayat tentang sabar',
        batas: 3,
        limit: 3
      })
    });
    console.log(res.status);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2).substring(0, 500));
  } catch (err) {
    console.error(err);
  }
}
test();
