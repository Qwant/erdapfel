import ContactView from '../../views/poi_bloc/contact.dot'
import Panel from "../../libs/panel"

function Contact(block) {
  this.block = block
  this.url = this.block.url
  this.panel = new Panel(this, ContactView)
}

export default Contact