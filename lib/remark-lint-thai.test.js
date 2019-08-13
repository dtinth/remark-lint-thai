const tests = `
✔ สวัสดี

✔ อินเทอร์เน็ต
✘ อินเตอร์เน็ท
✘ อินเตอร์เน็ต

✔ เว็บไซต์
✘ เวปไซต์

✔ ลิงก์
✘ ลิงค์
✘ ลิ้งก์
✘ ลิ้งค์

✔ อีเมล
✘ อีเมล์
✘ อีเมลล์
✘ อี-เมล
✘ อี-เมล์
✘ อี-เมลล์
`;

var remark = require("remark");

tests
  .split("\n")
  .map(l => l.trim())
  .forEach(l => {
    if (l.startsWith("#")) {
      // comment
    } else if (l.startsWith("✔")) {
      ok(l.substr(1).trim());
    } else if (l.startsWith("✘")) {
      ng(l.substr(1).trim());
    } else if (l) {
      throw new Error(
        "Expected a blank line, a comment line, or a test line. Instead, found: " +
          l
      );
    }
  });

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
