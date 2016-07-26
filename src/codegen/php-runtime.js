import {readFileSync} from 'fs'
import {join} from 'path'

export function phpRuntime() {
	return readFileSync(join(__dirname, 'runtime.php5'), 'utf8')
}
