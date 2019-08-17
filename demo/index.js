import './styles.css'

var remark = require('remark')
var report = require('vfile-reporter')

document.querySelector('#app').innerHTML = `
<p>ใส่ข้อความภาษาไทยที่นี่</p>
<textarea id="textarea"></textarea>
<pre id="report"></pre>
`

const textarea = document.querySelector('#textarea')
textarea.oninput = () => {
  localStorage.text = textarea.value
  update()
}
textarea.value = localStorage.text || ''

const reportElement = document.querySelector('#report')

async function update() {
  const output = await new Promise(resolve =>
    remark()
      .use(require('../lib/remark-lint-thai'))
      .process(textarea.value, function(err, file) {
        resolve(report(err || file))
      }),
  )
  reportElement.textContent = output
}

update()
