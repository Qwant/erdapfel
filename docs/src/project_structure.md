Here are a few words about the project structure :

### Panel
 _panel_ is the display elementary brick, similar to a web component.
 A panel declaration is a function which contains a panel field

```
function Panel() {
  this.panel = new Panel(this, panelView)
}
```

PanelView is a dot template imported with the following line:

```
import ErrorPanelView from 'dot-loader!../views/error_panel.dot'

```

The panel parent function is the state of the displayed panel.
Ex. function `ErrorPanel()` declare `currentMessage` field
`this.currentMessage = "-error-"`

`currentMessage` will be displayed in the corresponding view like this:
`{{= this.currentMessage }}`

If `this.currentMessage` is updated there is no mechanism to automaticaly redraw `ErrorPanel`, in order to redraw panel with the new state you have to call `this.update()`

#### Helper methods
```
this.panel.addClassName
this.panel.removeClassName
this.panel.toggleClassName
```

Theses methods manage delays with promises mechanics

*note on update* : this method redraw panel resulting on interrupting playing css animation of the current panel

### Events
Communication between components is done by custom event. `fire()` to propagate custom event & `listen()` to trigger the action

Add new event by editing `actions.js`
