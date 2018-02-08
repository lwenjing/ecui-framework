{
	text = $0;
	while (match(text, /px2rem\([0-9]+px\)/)) {
		printf ("%s", substr(text, 0, RSTART - 1));
		printf ("%drem", (substr(text, RSTART + 7, RSTART + RLENGTH - 2) / div));
		text = substr(text, RSTART + RLENGTH)
	}
	print text
}
