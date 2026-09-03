const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('https://equran.id/api/v2/surat/1');
    console.log(res.status, res.statusText);
    const text = await res.text();
    console.log(text.substring(0, 200));
  } catch (err) {
    console.error(err);
  }
}
test();
