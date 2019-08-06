var remark = require("remark");

ok("สวัสดี");

ng("อินเตอร์เน็ต");

ok("ลิงก์");
ng("ลิงค์");
ng("ลิ้งก์");
ng("ลิ้งค์");

ok("อีเมล");
ng("อีเมล์");
ng("อีเมลล์");
ng("อี-เมล");
ng("อี-เมล์");
ng("อี-เมลล์");

async function check(text) {
  const output = await remark()
    .use(Object.values(require("./remark-lint-thai")))
    .process(text);
  return output;
}

function ok(text) {
  test(`✔︎ ${text}`, async () => {
    const out = await check(text);
    expect(out.messages).toHaveLength(0);
  });
}

function ng(text) {
  test(`✘ ${text}`, async () => {
    const out = await check(text);
    expect(out.messages).toHaveLength(1);
  });
}
