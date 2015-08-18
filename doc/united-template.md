### element fragment (element with id)
```jedi
section.class1.class2#id
	...
```

### fragment (anonymous)
```jedi
#id
```

### import fragment
```jedi
:use url#id
```

### import fragment with parameters
```jedi
:import url#id = {x, y}
```

```jedi
#id of point = {x: 100, y: 0}
	= x
	= y
```

```jedi
dl#id of point = {x: 100, y: 0}
	dt 'x:'
	dd = x
	dt 'y:'
	dd = y
```

```jedi
:: dl.name of {givenName, familyName}
		dt 'Family name'
		dd "{familyName}"
		dt 'Given name'
		dd "{givenName}"
```
