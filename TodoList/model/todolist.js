async function getList(database) {
  const result = await database.all('SELECT * FROM todo')
  return result
}

module.exports = {
  getList
}