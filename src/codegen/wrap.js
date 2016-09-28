export default function wrap(before, body, after) {
	if (Array.isArray(body)) {
		if (before) {
			body[0] = wrap(before, body[0], '')
		}
		if (after) {
			body[body.length - 1] = wrap('', body[body.length - 1], after)
		}
		return body
	} else {
		return before + body + after
	}
}
