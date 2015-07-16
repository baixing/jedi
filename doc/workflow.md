# 模板开发流程

## 建立信息架构
```jedi
#contacts-list
	= myself
	= contacts.starred
	= contacts.unstarred
```

## 初步的细化实现
```jedi
#contacts-list
	ul.contacts
		= myself
			li.me > h1 = myself.fullName
		= contacts.starred
			*li.starred for c in contacts.starred
				dl.contact#pid-{c.id}
					dt 'First Name'
					dd = c.firstName
					dt 'Last Name'
					dd = c.lastName
		= contacts.unstarred
			*li = c.fullName for c in contacts.unstarred
```

## 复用
```jedi
:: dl.contact
		dt 'First Name
		dd = *.firstName
		dt 'Last Name
		dd = *.lastName

#contacts-list
	ul.contacts
		= myself
			li.me > h1 = *.fullName
		= contacts.starred
			*li.starred > dl.contact#pid-{*.id} = *.x
		= contacts.unstarred
			*li > dl.contact = *
```

## 复用是针对模型的
```jedi
:: dl.contact = {firstName, lastName}
		dt 'First Name
		dd = firstName
		dt 'Last Name
		dd = lastName

#contacts-list
	ul.contacts
		li.me > h1 = myself.fullName
		*li.starred > dl.contact#pid-{*.id} = contacts.starred
		*li > dl.contact = contacts.unstarred
```

## 应对视图的复杂性

	- normal list, group by star
	- 每个联系人的展现方式：
		- card-view
		- compact-view
		- details-view
	- 列表的展现方式：
		- simple-list (compact-view),
		- card-list (card-view or details-view or compact-view)
	- 分组方式：
		- group-by-alphabet
		- group-by-star
	- 排序方式：
		- sort-by-alphabet
		- sort-by-radicals


```jedi

#contact-list -- simple list of contacts
ul.contacts
	li.me > h1.simple-contact = myself
	:for groupName, groupItems in contacts.groupBy('alphabet')
	*li.simple-contact.group-{groupName} = contact in groupItems
		@class += 'star' if contact.starred

#contact-list -- card list of contacts
article.contacts
	section.myself = myself
	*section.group for groupName, groupItems in contacts.groupBy('star')
		@class += groupName
		*dl.contact = * in groupItems

:: *.simple-contact = {fullName}
		= fullName

:: dl.contact = {firstName, lastName}
		dt 'First Name
		dd = firstName
		dt 'Last Name
		dd = lastName

```
