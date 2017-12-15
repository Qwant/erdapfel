import MasqClient from '../libs/mask'

function MaskAction() {
  this.masqStore = new MasqClient('http://127.0.0.1:8081/')
}

MaskAction.prototype.connect = function () {
  return new Promise((resolve, reject) => {
    this.masqStore.onConnect().then(() => {
      this.masqStore.getAll().then((maskData) => {
        resolve(maskData)
      }).catch(function (error) {
        reject(error)
      })
    }).catch(function (error) {
      reject(error)
    })
  })
}

export default MaskAction