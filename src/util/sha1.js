import {createHash} from 'crypto'

export default function sha1(enc = 'base64') {
	const sum = createHash('sha1')
	sum.update(this)
	return sum.digest(enc)
}
