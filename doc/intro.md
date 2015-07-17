## Jedi吸取了以下模板或相关技术

可扩展性的机制主要来源于Ruby和Groovy中的Markup Builder
语法主要沿袭Jade，所做的修改参考了各方面因素
核心抽象机制来自于CSS Selector、XSLT和强类型编程语言
表达式考虑了各种语言，其中参考最多的是ES6+和PHP


## View的抽象和复用

有如下方式：

Include/Partial
如SSI、@include指令、jsp:include、Partial等

Jedi支持：

:include view params


## 和其他模板技术的对比

见 php-jade-jedi-comparison


### 语言



### Examples

```jedi
	:if x > 90
		p 'A
	:else if x > 80
		p 'B
	:else if x > 70
		p 'C
	:else
		p 'D
```

```jedi
nav > ul > *li = cat in categories
	?a = cat.label if !cat.disabled
		@href = cat.url
	^span = "{cat.name} is disabled!"

table = {fields: ['name', 'gender', 'age', 'tel']}
	col for f in fields
		@class += f
	thead
		tr > th "Name" + th "Gender" + th "Age" + th "Tel"
			= ':'
			= #
	tbody
		*tr for user in users
			*td = user[f] for f in fields

	div.a.b#id markdown
```

```jedi
	dl.contact#pid = contact
		dt 'First Name
		dd = contact.firstName
		dt 'Last Name
		dd = contact.lastName

	ul.contacts = contacts
		li > dl.contact#pid-{*.id}
				dt 'First Name
				dd = *.firstName
				dt 'Last Name
				dd = *.lastName
```


	:define dl (any)
		@dataset = any.meta

	:macro bx:contact (contact)
		:attr SpacedIDs class
		dl.contact#pid-{contact.id}
			@class += class
			dt 'First Name
			dd = contact.firstName
			dt 'Last Name
			dd = contact.lastName

	ul.contacts
		= myself
			li.me > h1 = *.fullName
		= contacts starred
			li > bx:contact.starred = *
		= contacts unstarred
			li > bx:contact.unstarred = *


	:define bx:contact (contact)
		:attr SpacedIDs class
		:attr CommaedIDs order
		dl.contact#pid-{contact.id}
			@class += class
			dt 'First Name
			dd = contact.firstName
			dt 'Last Name
			dd = contact.lastName

	ul.contacts
		= myself
			li.me > h1 = *.fullName
		= contacts starred
			li > bx:contact.starred = *
				@order = 'last, first'
		= contacts unstarred
			li > bx:contact.unstarred = *


	:define bx:contact
			li.starred > dl.contact#pid-{*.id}
				dt 'First Name
				dd = *.firstName
				dt 'Last Name
				dd = *.lastName

	ul.contacts
		= myself
			li.me > h1 = *.fullName
		= contacts starred
			bx:contact = *
		= contacts unstarred
			li > p = *.fullName


	div match score
		'A' case > 90
		'B' case > 80
		'C' case > 70
		'D' case *

	div
		:score > 90 ?
			'A'



	:define button
		startTag
		attrs #attr
		content
		endTag

	:define bx:if
		@extend bx:div
		div.container#myDiv (if @test)
			#content


	:if help
		button
			startTag
			attrs
			endTag

	:define html:button extends html:@element
		if ie < 8:
			@type 'button
		else:
		if ieq:
			div.{@tagName}

		.test

	:define bx

开启数据绑定后，默认自动更新，但是表单控件除外，默认会被锁定（lock）
会要求必须处理model-refresh事件，从最外层的form控件capture阶段开始。

最基本的元素：
	宏定义
	属性



Jedi

API

	var highlighted = jedi.process(source, jedi.highlighter.html)
	var source = jedi.process(source, jedi.compiler.es5)
	var runtime = jedi.Runtime()
	runtime.imports(jedi.libs.HTML5)
	var template = jedi.load(source)
	template(context, runtime)

Jedi.render(jediSource, imports)

jedi.Tokenizer
jedi.Builder
	comment(text)
	filter(name, expression, contentBuilder)
	tagBlock(tagName, classList, id, contentBuilder)
	block(id, tagName, classList, commonAttrs, childBuilder)
	attr(name, operator, expression)
	text(expression)

jedi.Compiler implements jedi.Builder

jedi.Highlighter implements jedi.Builder


model
	submission#s
		@get http://example.com/search

	input
		@ref q
		label:text
			search

	li > a.nav#link @href=http://example.com/link 'click here

	table
		thead
			tr > th "heading" + th "col1" + th "col2"
		tbody.{x}#{channel}
			tr > th {h[1]} + td "cell 1" + td "cell 2"
			tr > th {h[2]} + td "cell 1" + td "cell 2"

	input:text#username
	input:password:{user.password.required}#password

	label|username '用户
	input#username


	select1 @ref=method
		label 'Select Payment Method:
		item
			label 'Cash
			value 'cash
		item
			label 'Credit
			value 'cc
	input @ref=number
		label 'Credit Card Number:
	input @ref=expiry
		label 'Expiration Date:
	submit @submission=s
		label 'Submit


	bind
		@ref=payment.number
		@relevant? payment.method == 'cc'
		@required
		@type ccnumber
	bind
		@ref payment.expiry
		@relevant payment.method == 'cc'
		@required
		@type gYearMonth


	switch
		case#in @selected
			input @ref=yourname
				label 'Please tell me your name
				toggle
					@event='DOMActivate'
					@case out
		case#out
			p 'Hello' + output @ref=yourname
