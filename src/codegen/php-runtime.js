import {readFileSync} from 'fs'
import {join} from 'path'

export default () => readFileSync(join(__dirname, 'runtime.php5'), 'utf8')
