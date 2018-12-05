import Ajax from "../libs/ajax";
import nconf from "../../local_modules/nconf_getter";

const errorEventUrl = 'logs'
const system = nconf.get().system
const errorUrl = `${system.baseUrl}${errorEventUrl}`

listen('error_h', (error) => {
  Ajax.post(errorUrl, {error})
})

