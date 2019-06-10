const images = [];

export default async function loadImage(imagePath) {
  let storedImage = images.find((image) => {
    return image.imagePath === imagePath;
  });
  if (storedImage) {
    return Promise.resolve(storedImage.imgElement);
  } else {
    return new Promise((resolve, reject) => {
      let imgElement = document.createElement('img');
      imgElement.src = imagePath;
      imgElement.onload = () => {
        resolve(imgElement);
        images.push({imagePath: imagePath, imgElement: imgElement});
      };
      imgElement.onerror = (e) => {
        reject(e);
      };
      document.body.appendChild(imgElement);
    });
  }
}
