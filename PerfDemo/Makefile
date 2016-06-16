all: canvas.js css.js
clean:
	rm *.js
%.js: %.ts
	tsc --removeComments --noEmitOnError $< --out $@
