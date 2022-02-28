const puppeteer = require('puppeteer')
const lighthouse = require('lighthouse')
const desktopConfig = require('lighthouse/lighthouse-core/config/desktop-config')
const mobileConfig = require('lighthouse/lighthouse-core/config/default-config')
const { URL } = require('url')

const args = process.argv.splice(2)
const extendsData = [
  mobileConfig,
  desktopConfig
]

;(async () => {
  if (!args[0]) {
    console.log('arguments error')
    return
  }
  const [url, extendsIndex ] = args
  // 启动 puppeteer
  const browser = await puppeteer.launch({
    // headless: false,
    defaultViewport: null,
  })
  // 钩⼦函数，等待⻚⾯打开之后获取具体的性能指标
  browser.on('targetchanged', async target => {
    const page = await target.page()
    if (page && page.url() === url) {
    }
  })

  // 通过 Lighthouse 打开⻚⾯，使⽤的端⼝号要与 Puppeteer 启动端⼝号保持⼀致
  const { lhr, report } = await lighthouse(
    url,
    {
      onlyCategories: ['performance'],
      port: new URL(browser.wsEndpoint()).port,
      output: 'json',
    },
    extendsData[extendsIndex]||extendsData[0]
  )
  // fs.writeFileSync('perf.json',rest.report)
  const indexes = [
    'first-contentful-paint',
    'interactive',
    'speed-index',
    'total-blocking-time',
    'largest-contentful-paint',
    'cumulative-layout-shift',
  ]
  const indexMapToShorthand = {
    'first-contentful-paint': 'FCP',
    interactive: 'TTI',
    'speed-index': 'SI',
    'total-blocking-time': 'TBT',
    'largest-contentful-paint': 'LCP',
    'cumulative-layout-shift': 'CLS',
  }
  indexes.forEach(el => {
    console.log(indexMapToShorthand[el])
  })
  indexes.forEach(el => {
    const val = JSON.parse(report)?.audits[el]?.displayValue
    console.log(parseFloat(val))
  })
  console.log(`${lhr.categories.performance.score * 100}`)
  await browser.close()
})()
