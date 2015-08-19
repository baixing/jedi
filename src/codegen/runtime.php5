<?php

function jedi_runtime_reference(&$ref) {
	return $ref;
}

function jedi_runtime_attribute($name, $value) {
	if ($value === null || $value === false) return '';
	if ($value === true) return ' ' . $name;
	return ' ' . $name . '="' . htmlspecialchars($value, ENT_COMPAT | ENT_SUBSTITUTE | ENT_DISALLOWED) . '"';
}
