const Sugar = require('sugar-date')
const easterDay = require('@jsbits/easter-day')
const format = require('date-fns/format')
const addDays = require('date-fns/addDays')
const addMinutes = require('date-fns/addMinutes')
const getISODay = require('date-fns/getISODay')

const _getISODayInt = weekday => {
  if (weekday === 'Monday') {
    return 1
  }

  if (weekday === 'Friday') {
    return 5
  }

  throw new Error(`Weekday not parsable: ${weekday}`)
}

const _parseRelativeDates = dateString => {
  let [weekday, position, ...anchorDate] = dateString.split(' ')

  anchorDate = anchorDate.join(' ')

  if (anchorDate.includes('Easter')) {
    anchorDate = easterDay(2019)
  } else {
    anchorDate = Sugar.Date.create(anchorDate)
  }

  weekday = _getISODayInt(weekday)
  position = position === 'before' ? -1 : 1

  let count = 0
  // addDays to the current anchorDay until the day of the week matches
  while (weekday !== getISODay(addDays(anchorDate, position * count))) {
    count++
  }

  return addDays(anchorDate, position * count)
}

const getISODate = dateString => {
  let date

  if (/First|Second|Third|Fourth/i.test(dateString)) {
    dateString = `The ${dateString}`
  }

  if (/before|after/i.test(dateString)) {
    date = _parseRelativeDates(dateString)
  } else {
    date = Sugar.Date.create(dateString)
  }

  // Test for invalid dates
  if (isNaN(date)) {
    throw new Error(`Date string not parsable: ${dateString}`)
  }

  return date.toISOString().substring(0, 10)
}

// 60 minutes * 24 hours = 1440
const getDateBeforeMidnightFromString = str => addMinutes(new Date(str), 1439)

const space2Nbsp = str => str.replace(/ /g, ' ')

const displayDate = dateString =>
  space2Nbsp(format(getDateBeforeMidnightFromString(dateString), 'MMMM do'))

module.exports = { getISODate, displayDate }
