'use strict'

var isCharArray = require('./util').isCharArray

var xhtmlMods = {
	structure: ['body', 'head', 'html', 'title'],
	text: ['abbr', 'acronym', 'address', 'blockquote', 'br', 'cite', 'code', 'dfn', 'div', 'em',
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'kbd', 'p', 'pre', 'q', 'samp', 'span', 'strong', 'var'],
	hypertext: ['a'],
	list: ['dl', 'dt', 'dd', 'ol', 'ul', 'li'],
	forms: ['button', 'fieldset', 'form', 'input', 'label', 'legend', 'select', 'optgroup', 'option', 'textarea'],
	tables: ['caption', 'table', 'td', 'th', 'tr'],
	image: ['img'],
	object: ['object', 'param'],
	presentation: ['b', 'big', 'hr', 'i', 'small', 'sub', 'sup', 'tt'],
	metainformation: ['meta'],
	link: ['link'],
	base: ['base'],
	events: [],
	scripting: ['script', 'noscript'],
	stylesheet: ['style'],
	styleAttribute: [],
	targetAttribute: [],
	inputmodeAttribute: [],
}
var xhtmlBasicElements = [].concat(
	xhtmlMods.structure,
	xhtmlMods.text,
	xhtmlMods.hypertext,
	xhtmlMods.list,
	xhtmlMods.forms,
	xhtmlMods.tables,
	xhtmlMods.image,
	xhtmlMods.object,
	xhtmlMods.presentation,
	xhtmlMods.metainformation,
	xhtmlMods.link,
	xhtmlMods.base,
	xhtmlMods.scripting,
	xhtmlMods.stylesheet)

var voidElements = 'area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr'.split(',')
var blockElements = 'header,footer,hgroup,section,article,aside,video,audio,canvas,address,blockquote,dd,div,dl,fieldset,figcaption,figure,form,h1,h2,h3,h4,h5,h6,hr,noscript,ol,output,p,pre,table,ul'.split(',')

var lastTag = null

var Output = {
	escapeComment: function escapeComment(s) {
		// http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html#comments
		// Comment must not contain two consecutive U+002D HYPHEN-MINUS characters (--)
		return s.replace(/--/g, '- -')
	},
	escapeScriptSource: function escapeScriptSource(s) {
		return s.replace(/<\/script>/g, '<\\/script>')
	},
	escapeText: function escapeText(s) {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
	},
	phpEscapeText: function phpEscapeText(s) {
		return 'htmlspecialchars(' + s + ', 0x88)' // ENT_SUBSTITUTE | ENT_DISALLOWED
	},
	attrValue: function attrValue(s) {
		return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
	},
	phpAttrValue: function phpAttrValue(s) {
		return 'htmlspecialchars(' + s + ', 0x8a)' // ENT_COMPAT | ENT_SUBSTITUTE | ENT_DISALLOWED
	},
	startTag: function startTag(tag, cls, id) {
		lastTag = tag
		return echo(
			'<', tag,
			cls.length > 0 ? ' class="' + cls.join(' ') + '"' : '',
			id ? ' id="' + id + '"' : '')
	},
	closeStartTag: function () {
		return voidElements.indexOf(lastTag) >= 0 ?
			echo(' />') :
			echo('>')
	},
	endTag: function endTag(tag) {
		return voidElements.indexOf(tag) >= 0 ?
			[] :
			echo('</', tag, '>')
	},
}

var OutputHTML = Object.create(Output)
OutputHTML.closeStartTag = function () {
	return echo('>')
}
OutputHTML.escapeText = function escapeText(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

var OutputXML = Object.create(Output)
var OutputXHTML = Object.create(OutputXML)
OutputXHTML.startTag = function (tag, cls, id) {
	if (xhtmlBasicElements.indexOf(tag) === -1) {
		if (cls.indexOf(tag) === -1) cls = [tag].concat(cls)
		tag = blockElements.indexOf(tag) === -1 ? 'span' : 'div'
	}
	lastTag = tag
	var r = echo(
		'<', tag,
		cls.length > 0 ? ' class="' + cls.join(' ') + '"' : '',
		id ? ' id="' + id + '"' : '')
	return r
}
OutputXHTML.endTag = function (tag) {
	if (xhtmlBasicElements.indexOf(tag) === -1) {
		tag = blockElements.indexOf(tag) === -1 ? 'span' : 'div'
	}
	return OutputXML.endTag(tag)
}

function echo() {
	var args = [].slice.call(arguments).reduce(function(a, b){
		if (isCharArray(b)) b = b.join('')
		if (typeof b === 'string' && typeof a[a.length - 1] === 'string') {
			a[a.length - 1] += b
		} else {
			a.push(b)
		}
		return a
	}, []).map(function(o){
		if (typeof o === 'string') {
			return "'" + o.replace(/'/g, "\\'") + "'"
		}
		return JSON.stringify(o)
	})
	return 'echo ' + args.join(', ') + ';'
}


exports.OutputHTML = OutputHTML
exports.OutputXML = OutputXML
exports.OutputXHTML = OutputXHTML
