## Evolution from PHP to Jade to Jedi

### PHP

```php
<header>
	<? if (!empty($welcome)): ?>
		<p class="message"><?= $welcome ?>
	<? endif ?>

	<nav><ol class="process">
		<? foreach ($steps as $step): ?>
			<li>
				<a <?= $currentStep === $step ? '' : "href=\"step?id={$step->id}\"" ?>>
					<?= $step->summary ?>
				</a>
		<? endforeach ?>
	</ol></nav>
</header>

<main id="<?= currentStep->id ?>">
	<h1><?= $currentStep->summary ?></h1>
	<?= markdownToHTML($currentStep->content) ?>
</main>
```

### Jade

```jade
header
	if info
		p.message= info
	nav: ol.process
		each step in steps
			li
				a(href= currentStep === step ? null : "step?id=#{step.id}")
					= step.summary
main(id= currentStep.id)
	h1= currentStep.summary
	:markdown currentStep.content
```

### Jedi (Jade-like)

```jedi
header
	:if info
		p.message
			= info
	nav > ol.process
		:for step in steps
			li
				a
					@href = { if currentStep !== step then "step?id={step.id}" }
					= step.summary
main @id = currentStep.id
	h1
		= currentStep.summary
	:markdown currentStep.content
```

### Jedi (post-instructions syntax)

```jedi
header
	?p.message if info
		= info
	nav > ol.process
		*li for step in steps
			a	@href = { if currentStep !== step then "step?id={step.id}" }
				= step.summary
main @id = currentStep.id
	h1
		= currentStep.summary
	:markdown currentStep.content
```

### Jedi (more terse)

```jedi
header
	?p.message = info if info
	nav > ol.process
		*li > a = step.summary for step in steps
			@href = "step?id={step.id}" if step !== currentStep
main#step{step.id}
	h1 = currentStep.summary
	:markdown currentStep.content
```

### Jedi (even more terse, with the help of sub-templates)

```jedi
header
	?p.message = info
	nav > ol.process:item-links = steps
		:: a = step
				@href if step !== currentStep
main = currentStep

:: ol:item-links = items
		*li > a = item in items
			@href = "{item.type}?id={item.id}"
			= item.summary

:: main = step
		h1 = step.summary
		:markdown step.content
```

### Jedi (separate to individual files)

```jedi
header
	?p.message = info
	:import common
	nav > ol.process:item-links = steps
			:: a = step
					@href if step !== currentStep
main
	:import step = {step: currentStep}

```

`./common.jedi`
```
:: ol:item-links = items
		*li > a = item in items
			@href = "{item.type}?id={item.id}"
			= item.summary
```

`./step.jedi`
```jedi
h1 = step.summary
:markdown step.content
```
