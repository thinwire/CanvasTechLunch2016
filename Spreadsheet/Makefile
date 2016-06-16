all: step1.js step2.js step3.js step4.js step5.js step6.js step7.js

clean:
	rm -f *.js
%.js: %.ts
	tsc --removeComments --noEmitOnError $< --out $@
