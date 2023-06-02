const fs = require('fs')
const path = require('path')

let dataCache = {}

function loadData() {
  const file = path.resolve(__dirname, '../../mock/data.json')
  const data = JSON.parse(fs.readFileSync(file, {encoding: 'utf-8'}))

  data.forEach(item => {
    dataCache[item.updatedDate] = item
  });
  return dataCache
}

function getCoronavirusKeyIndex() {
  return Object.keys(loadData())
}

function getCoronavirusByDate(date) {
  return loadData()[date]
}

module.exports = {
  getCoronavirusKeyIndex,
  getCoronavirusByDate
}