import AccessibilityView from '../../views/poi_bloc/accessibility.dot'
import Panel from "../../libs/panel";

function Accessibility(accessibilityList, poi, managedAccessibilityList) {
  this.panel = new Panel(this, AccessibilityView)
  this.managedAccessibilityList = managedAccessibilityList
  this.accessibilityList = accessibilityList
}

Accessibility.prototype.toString = function () {
  return this.managedAccessibilityList.map((managedAccessibility) => {
    let accessibility = this.accessibilityList[managedAccessibility.key]
    return _(managedAccessibility.labels[accessibility])
  }).join(' ')
}

export default Accessibility
