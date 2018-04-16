module.exports = function (data) {
  const gettextPatter =  /"_n?\((.*?)\)"/g
  return data.replace(gettextPatter, '$1')
}