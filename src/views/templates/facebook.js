export default location => {
  return `https://www.facebook.com/sharer/sharer.php?u=${ encodeURIComponent(location) }`;
};
