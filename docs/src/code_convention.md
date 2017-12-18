# Code convention

### JavaScript

no eof with ;
camelCase
es6

### css / scss

use BEM :
```html
.component                            /* Component */
.component__element                   /* Child */
.component__element__element          /* Grandchild. PS. Avoid Grandgrandchild */

.--modifier                           /* Single property modifier, can be chained */

.h-property                           /* Helpers (eg. `h-align-right`, `h-margin-top-s`) */

.js-hook                              /* Script hook, not used for styling */

.items                                /* Use plurals if possible */
.item
```

no nesting
