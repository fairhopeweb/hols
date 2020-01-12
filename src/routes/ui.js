const express = require('express')
const router = express.Router()
const db = require('sqlite')
const createError = require('http-errors')
const renderPage = require('../pages/_document.js')
const { dbmw, checkProvinceIdErr, nextHoliday, getCurrentHolidayYear } = require('../utils')
const { getProvinces, getHolidaysWithProvinces, getProvincesWithHolidays } = require('../queries')
const { displayDate } = require('../dates')

const getMeta = holiday => `${holiday.nameEn} on ${displayDate(holiday.date)}`

router.get('/', dbmw(db, getHolidaysWithProvinces), (req, res) => {
  const year = getCurrentHolidayYear()
  const holidays = res.locals.rows
  const nextHol = nextHoliday(holidays)

  const meta = `Canada’s next stat holiday is ${getMeta(
    nextHol,
  )}. See all statutory holidays in Canada in ${year}.`

  return res.send(
    renderPage({
      pageComponent: 'Province',
      title: `Canadian statutory holidays in ${year}`,
      docProps: { meta, path: req.path },
      props: { data: { holidays, nextHoliday: nextHol, year } },
    }),
  )
})

router.get(
  '/province/:provinceId',
  checkProvinceIdErr,
  dbmw(db, getProvincesWithHolidays),
  (req, res) => {
    const year = getCurrentHolidayYear()
    const { holidays, nextHoliday, nameEn: provinceName, id: provinceId } = res.locals.rows[0]

    const meta = `${provinceId}’s next stat holiday is ${getMeta(
      nextHoliday,
    )}. See all statutory holidays in ${provinceName}, Canada in ${year}.`

    return res.send(
      renderPage({
        pageComponent: 'Province',
        title: `${provinceName} (${provinceId}) statutory holidays in ${year}`,
        docProps: { meta, path: req.path },
        props: {
          data: { holidays, nextHoliday, provinceName, provinceId, year },
        },
      }),
    )
  },
)

router.get('/federal', dbmw(db, getHolidaysWithProvinces), (req, res) => {
  const year = getCurrentHolidayYear()
  const holidays = res.locals.rows
  const nextHol = nextHoliday(holidays)

  const meta = `Canada’s next federal stat holiday is ${getMeta(
    nextHol,
  )}. See all federal statutory holidays in Canada in ${year}.`

  return res.send(
    renderPage({
      pageComponent: 'Province',
      title: `Federal statutory holidays in Canada in ${year}`,
      docProps: { meta, path: req.path },
      props: { data: { holidays, nextHoliday: nextHol, federal: true, year } },
    }),
  )
})

router.get('/provinces', dbmw(db, getProvinces), (req, res) => {
  return res.send(
    renderPage({
      pageComponent: 'Provinces',
      title: 'All regions in Canada — Canada statutory holidays',
      docProps: {
        meta: `Upcoming stat holidays for all regions in Canada. See all federal statutory holidays in Canada in ${getCurrentHolidayYear()}.`,
        path: req.path,
      },
      props: { data: { provinces: res.locals.rows } },
    }),
  )
})

router.get('/province', (req, res) => res.redirect(302, '/provinces'))

router.get('/do-federal-holidays-apply-to-me', (req, res) => {
  return res.send(
    renderPage({
      pageComponent: 'FederallyRegulated',
      title: 'Do federal holidays apply to me? — Canada statutory holidays',
      docProps: {
        meta: 'How to tell if you get federal holidays or provincial holidays in Canada.',
        path: req.path,
      },
    }),
  )
})

router.get('/about', dbmw(db, getHolidaysWithProvinces), (req, res) => {
  const nextHol = nextHoliday(res.locals.rows)

  return res.send(
    renderPage({
      pageComponent: 'About',
      title: 'About — Canada statutory holidays',
      docProps: {
        meta: 'Check my sources, use the API, get in touch, etc.',
        path: req.path,
      },
      props: { data: { nextHoliday: nextHol } },
    }),
  )
})

router.get('/feedback', (req, res) => {
  return res.send(
    renderPage({
      pageComponent: 'Feedback',
      title: 'Feedback — Canada statutory holidays',
      docProps: {
        meta: 'Reprt a problem, tell me I’m cool, or let’s just chat even.',
        path: req.path,
      },
    }),
  )
})

router.get('*', (req, res) => {
  res.status(404)
  throw new createError(404, 'Oopsie daisy. Maybe head back to the home page? 👇')
})

// eslint-disable-next-line no-unused-vars
router.use(function(err, req, res, next) {
  return res.send(
    renderPage({
      pageComponent: 'Error',
      title: `Error: ${res.statusCode} — Canada statutory holidays`,
      docProps: { meta: err.message.split('.')[0], path: req.path },
      props: {
        data: {
          status: res.statusCode,
          message: err.message,
        },
      },
    }),
  )
})

module.exports = router
