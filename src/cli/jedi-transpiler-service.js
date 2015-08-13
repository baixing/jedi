import pkg from '../../package'
import program from 'commander'

program.
	version(pkg.version).
	usage('[options] <basedir>').
	option('--php', '编译为PHP').
	option('--js', '编译为JavaScript').
	option('-w, --watch', '当指定文件的内容变化时自动重新编译').
	option('-p, --port <n>', '编译服务端口', parseInt).
	parse(process.argv)

const lang = []
if (program.php) lang.push('php')
if (program.js) lang.push('js')

import service from '../service'
service({
	lang: lang,
	base: program.args[0] || process.cwd(),
	port: program.port || 1337,
})
