var i = 0
function a(x) {
	i++
	if (i % 100 === 0) console.log(i)
	a.apply(null, new Array(i))
}
a(100)