export default (location, title, text) => {
  return `https://www.facebook.com/sharer/sharer.php?
  &link=${encodeURIComponent(location)}
  &redirect_uri=http%3A%2F%2Fwww.facebook.com%2F`
}
