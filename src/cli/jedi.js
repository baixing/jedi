import pkg from '../../package'
import program from 'commander'

program.
	usage('[options] <source> <dest>').
	version(pkg.version).
	option('-a, --adaptive', '生成多个适配版本').
	option('-b, --bak', '保留备份').
	option('-w, --watch', '当源文件的内容变化时自动重新编译').
	option('-1, --tree1', '查看语法树（阶段1）').
	option('-2, --tree2', '查看语法树（阶段2）').
	option('-3, --tree3', '查看语法树（阶段3）').
	option('-4, --tree4', '查看语法树（阶段4）').
	parse(process.argv)

if (program.args.length < 1) {
	program.help()
	process.exit(0)
}

import {existsSync} from 'fs'
let src = program.args[0]
if (!existsSync(src)) {
	src += '.jedi'
	if (!existsSync(src)) {
		console.error('文件' + src + '不存在')
		process.exit(1)
	}
}

let dest = program.args[1], lang
switch (dest) {
	case 'php': case 'php5': case 'php7':
	case 'js': case 'es5': case 'es6':
		lang = dest
		dest = src.replace(/(\.jedi)?$/, '.' + dest)
		break
	default:
		const m = /\.(php|php5|php7|js|es5|es6)$/.exec(dest)
		lang = m ? m[1] : null
}

const opts = {
	adaptive: program.adaptive,
	debug: [program.tree1, program.tree2, program.tree3, program.tree4],
	writeErrorToFile: !!program.watch,
	bak: program.bak,
}
const args = [src, dest, lang, opts]
import {transpile, watch} from '..'
if (program.watch) watch(...args)
else transpile(...args)
