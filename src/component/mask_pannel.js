import MaskAction from '../mask/mask_action'

function MaskPannel() {
  this.maskAction = new MaskAction()
  let maskDataPromise = this.maskAction.connect()
  maskDataPromise.then((maskData)=> {
    console.log(maskData)
  })
}

export default MaskPannel
