const tests = []

global.expect = require('expect')
global.test = (title, action) => {
  tests.push({ title, action })
}

async function startTest() {
  const container = document.querySelector('#test')
  const testInfo = document.querySelector('#test-info')
  let passing = 0
  let failed = 0
  for (const test of tests) {
    const el = document.createElement('div')
    el.textContent = test.title
    el.className = 'text-info'
    container.appendChild(el)
    let error
    try {
      await test.action()
    } catch (e) {
      error = e
    }
    if (error) {
      const alert = document.createElement('div')
      alert.textContent = String(error && error.stack)
      alert.className = 'alert alert-danger'
      alert.style.whiteSpace = 'pre-wrap'
      container.appendChild(alert)
      el.className = 'text-danger'
      failed++
    } else {
      el.className = 'text-success'
      passing++
    }
    testInfo.textContent = `${passing} passing, ${failed} failed`
  }
}

require('../lib/remark-lint-thai.test')
startTest()
