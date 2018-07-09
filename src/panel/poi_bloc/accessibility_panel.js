import AccessibilityView from '../../views/poi_bloc/accessibility.dot'
import Panel from "../../libs/panel";

function Accessibility(accessibilityList, poi, managedAccessibilityList) {
  this.panel = new Panel(this, AccessibilityView)
  this.managedAccessibilityList = managedAccessibilityList
  this.accessibilityList = accessibilityList
}

export default Accessibility
