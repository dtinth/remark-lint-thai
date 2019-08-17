const rule = require('unified-lint-rule')
const visit = require('unist-util-visit')
const toString = require('unist-util-to-string-with-nodes')
const vfileLocation = require('vfile-location')

const spell = (pattern, correct) => ({
  pattern,
  check(match) {
    const expected = typeof correct === 'function' ? correct(match) : correct
    if (Array.isArray(expected)) {
      if (!expected.includes(match[0])) {
        return `“${match[0]}” → ${expected.map(x => `“${x}”`).join(' / ')}`
      }
    } else {
      if (match[0] !== expected) {
        return `“${match[0]}” → “${expected}”`
      }
    }
  },
})

const rules = [
  // https://www.blognone.com/writing_guideline
  {
    pattern: /[\u0E01-\u0EFF]\w/g,
    message: 'Add a space between Thai and Non-Thai text',
  },
  {
    pattern: /\w[\u0E01-\u0EFF]/g,
    message: 'Add a space between Non-Thai and Thai text',
  },
  {
    pattern: /([ขฃฉฐถผฝศษสห])([ิีึืุูั]?)(๊|๋)/g,
    check(match) {
      return match[3] === '๊'
        ? 'High-class consonants may not use mai tri (use another consonant)'
        : 'High-class consonants may not use mai chattawa (remove the tone mark)'
    },
  },
  {
    pattern: /([คฅฆงชซฌญฑฒณทธนพฟภมยฬฮ]|(?<![กจฎฏดตบปอ])[รลว])([ิีึืุูั]?)(๊|๋)/g,
    check(match) {
      return match[3] === '๊'
        ? 'Low-class consonants may not use mai tri (use mai tho instead)'
        : /[งญนมยรลวฬ]/.test(match[1])
        ? 'Low-class consonants may not use mai chattawa (use "ห' +
          match[1] +
          '" instead)'
        : 'Low-class consonants may not use mai chattawa (use another consonant)'
    },
  },
  {
    pattern: /ๆ([\u0E01-\u0EFF\w])/g,
    check(match) {
      if (match[1] !== 'ๆ') return 'Add a space after ๆ'
    },
  },

  // https://www.blognone.com/writing_guideline
  spell(/(?:ลิ|ลิ้)ง(?:ก์|ค์)/g, 'ลิงก์'),
  spell(/อี-?(?:เมลล์|เมล์|เมล)/g, 'อีเมล'),
  spell(/ซอฟ(?:ต์|ท์)?แวร์/g, 'ซอฟต์แวร์'),
  spell(/ไมโครซอฟ(?:ต์|ท์)?/g, 'ไมโครซอฟท์'),
  spell(/อินเ[ตท]อ(?:ร์)?เน็[ตท]?/g, 'อินเทอร์เน็ต'),
  spell(/เว็[บพป]|เวป/g, 'เว็บ'),
  spell(/เ?บรา(?:ว์?)?เซอร์/g, 'เบราว์เซอร์'),
  spell(/โอเพ่?น(ซอ(?:ร์)?[ซส])?/g, m => 'โอเพน' + (m[1] ? 'ซอร์ซ' : '')),
  spell(/แอปเปิ้?ล/g, 'แอปเปิล'),
  spell(/กูเกิ้?ล/g, 'กูเกิล'),

  // More from Blognone
  spell(/กราฟ?ฟิ[คก]/g, 'กราฟิก'),
  spell(/(?:อัป|อัพ|อัฟ)(?:เดท|เดต)/g, ['อัพเดต', 'อัปเดต']),
  spell(/นิวยอร์ค/g, 'นิวยอร์ก'),
  spell(/โปร?แกร?ม/g, 'โปรแกรม'),
  spell(/อาจะ/g, 'อาจจะ'),
  spell(/ได(ร์|รฟ์)เ(ว|ว่)อ(ร์)?/g, 'ไดรเวอร์'),
  spell(/อุปกณ์/g, 'อุปกรณ์'),
  spell(/แผนการณ์/g, 'แผนการ'),
  spell(/(เซอ(ร์)?|เซิ(ร์)?ฟ)เ(ว|ว่)อ(ร์)?/g, 'เซิร์ฟเวอร์'),
  spell(/อุ[นณ]ห?ภูมิ/g, 'อุณหภูมิ'),
  spell(/(?:เฟิรม|เฟิม|เฟอร์ม)แวร์/g, 'เฟิร์มแวร์'),
  spell(/ทฤษฏี/g, 'ทฤษฎี'),
  spell(/ปฎิบัติ/g, 'ปฏิบัติ'),
  spell(/(?:ฟิ|ฟี)(?:ลม์|ล์ม)/g, 'ฟิล์ม'),
  spell(/นัยยะสำคัญ/g, 'นัยสำคัญ'),
  spell(/อื่รๆ/g, 'อื่นๆ'),
  spell(/แบรดน์/g, 'แบรนด์'),
  spell(/ยูทูป|ยูทิวบ์|ยูทิวป์/g, 'ยูทูบ'),
  spell(/แพลทฟอร์ม/g, 'แพลตฟอร์ม'),
  spell(/โซเชี่ยล/g, 'โซเชียล'),
  spell(/บริศัท/g, 'บริษัท'),
  spell(/ผุ้ใช้/g, 'ผู้ใช้'),
  spell(/หมายควาย/g, 'หมายความ'),
  spell(/เป็ฯ/g, 'เป็น'),
  spell(/อิสระ?ภาพ/g, 'อิสรภาพ'),
  spell(/(สถา(?:น|ณ)ะ?การ(?:ณ์)?)/g, m =>
    m[1] === 'สถานะการ' ? 'สถานะการ' : 'สถานการณ์',
  ),
  spell(/รักษาการณ์/g, 'รักษาการ'),
  spell(/แอนดรอย(?!ด์)/g, 'แอนดรอยด์'),
  spell(/โน้[ตท](?:บุ|บุ๊)[กค]/g, 'โน้ตบุ๊ก'),
  spell(/กรนี/g, 'กรณี'),
  spell(/เสิ(?:ร์)?ชเ(?:อ|อ็)น(?:จิ|จิ้)น/g, 'เสิร์ชเอนจิน'),
  spell(/เบลเยี่ยม/g, 'เบลเยียม'),
  spell(/ไท(?:ทา|เท)เ(?:นี|นี่)ยม/g, 'ไทเทเนียม'),
  spell(/มิวนิค/g, 'มิวนิก'),
  spell(/อะ?ลู(?:มิ|มี)เ(?:นี|นี่)ยม/g, 'อะลูมิเนียม'),
  spell(/ปลดล็อค/g, 'ปลดล็อก'),
  spell(/แอคเ(?:ค|ค้)า(?:น์|ท์)?/g, 'แอคเคาท์'),

  // https://th.wikipedia.org/wiki/รายการคำในภาษาไทยที่มักเขียนผิด
  spell(/กะเพาะ|กะเพราะ|กระเพราะ/g, 'กระเพาะ'),
  spell(/กิริยา/g, 'กริยา'),
  spell(/กลิ่นไอ/g, 'กลิ่นอาย'),
  spell(/กระทันหัน/g, 'กะทันหัน'),
  spell(/(?:กะเพา|กระเพา|กระเพรา)(?!ะ)/g, 'กะเพรา'),
  spell(/โขมย/g, 'ขโมย'),
  spell(/ค[รล]อบ(?:คลุม|คุม|ครุม)/g, 'ครอบคลุม'),
  spell(/คำ[นณ]ว[นณ]/g, 'คำนวณ'),
  spell(/คุ้กกี้/g, 'คุกกี้'),
  spell(/จตุรัส/g, 'จัตุรัส'),
  spell(/(?<!แจ้งวัฒ|ฐา|มีมา|มุ่งมา|น้ำปา|อาส|ธรรมสว|พาช|หาย|ช|สถา)(นะค่ะ)/g, ['นะคะ', 'น่ะค่ะ']),
  spell(/ประเมิณ/g, 'ประเมิน'),
  spell(/ปรากฎ/g, 'ปรากฏ'),
  spell(/ป[าะ]?(?:ฏิ|ฎิ)(?:หารย์|หาริย์|หาร)/g, 'ปาฏิหาริย์'),
  spell(/เปอร์เซนต์/g, 'เปอร์เซ็นต์'),
  spell(/ผลลัพท์/g, 'ผลลัพธ์'),
  spell(/ฝรั่งเศษ/g, 'ฝรั่งเศส'),
  spell(/พฤษจิกายน/g, 'พฤศจิกายน'),
  spell(/พฤศภาคม/g, 'พฤษภาคม'),
  spell(/ฟัง(?:ก์|ค์)?(?:ชัน|ชั่น)/g, 'ฟังก์ชัน'),
  spell(/ภาพยนต์/g, 'ภาพยนตร์'),
  spell(/รนรงค์/g, 'รณรงค์'),
  spell(/รังเ(?:กลี|กี)ย[ดจ]/g, 'รังเกียจ'),
  spell(/ร้องให้/g, 'ร้องไห้'),
  spell(/ละเอียดละ?ออ/g, 'ละเอียดลออ'),
  spell(/ลายเซ็นต์/g, 'ลายเซ็น'),
  spell(/ลิฟท์/g, 'ลิฟต์'),
  spell(/(?:วิ|วี)(?:ดิ|ดี)โอ/g, 'วิดีโอ'),
  spell(/วิจารย์/g, 'วิจารณ์'),
  spell(/(?:วิ|วี)(?:ดิ|ดี)ทัศน์/g, 'วีดิทัศน์'),
  spell(/เวท(?:ย์)?มน(?:ตร์|ต์)/g, 'เวทมนตร์'),
  spell(/ศรีษะ/g, 'ศีรษะ'),
  spell(/แสกน/g, 'สแกน'),
  spell(/สันนิษ?ฐา[นณ]/g, 'สันนิษฐาน'),
  spell(/สาปสูญ/g, 'สาบสูญ'),
  spell(/สังเกตุ/g, 'สังเกต'),
  spell(/สังเขบ/g, 'สังเขป'),
  spell(/อนุญาติ/g, 'อนุญาต'),
  spell(/อนุเสาวรีย์/g, 'อนุสาวรีย์'),
  spell(/เอนก/g, 'อเนก'),
  spell(/(?:ออฟ|อ็อฟ|อ๊อฟ)(?:ฟิศ|ฟิส|ฟิต|ฟิซ)/g, 'ออฟฟิศ'),
  spell(/โอกาศ/g, 'โอกาส'),
  spell(/ไอศครีม/g, 'ไอศกรีม'),

  // https://th.wikipedia.org/wiki/วิกิพีเดีย:โครงการคำทับศัพท์
  spell(/โ[พป]รเจ(?:กต์|ค)/g, 'โปรเจกต์'),
  spell(/(ซอ(?:ร์)?[ซส])?โค้ด/g, 'ซอร์ซโค้ด'),

  // Et cetera
  spell(/คอมโพเ(?:น|น้)น(?:ต์|ท์)/g, 'คอมโพเนนต์'),
  spell(/เทคนิก/g, 'เทคนิค'),
]

// For testing
const unusedRules = new Set(rules)

const thai = rule('remark-lint:thai', function processor(tree, file) {
  const loc = vfileLocation(file)
  visit(tree, 'text', function visitor(node, position, parent) {
    const { text } = toString(node)
    for (const r of rules) {
      if (!r.pattern) continue
      for (const pattern of [].concat(r.pattern)) {
        if (!pattern.global) throw new Error(pattern + ' not global!')
        for (
          let match = pattern.exec(text);
          match;
          match = pattern.exec(text)
        ) {
          const point = {
            start: loc.toPosition(node.position.start.offset + match.index),
            end: loc.toPosition(
              node.position.start.offset + match.index + match[0].length - 1,
            ),
          }
          if (r.check) {
            const message = r.check(match)
            if (message) {
              file.message(message, point)
              unusedRules.delete(r)
            }
          } else if (r.message) {
            file.message(r.message, point)
            unusedRules.delete(r)
          }
        }
      }
    }
  })
})

thai.TEST_unusedRules = unusedRules

module.exports = thai
