
version := $(shell git describe --tags)

all: css js

js-name := build/scratchblocks-$(version)-min.js
js : $(js-name)
$(js-name) : \
	    src/scratchblocks2.js \
	    src/diacritics.js
	mkdir -p build/
	uglifyjs $^ --comments --output $@

css : src/blockpix.css
	sed -i '' 's/var cssContent =.*/var cssContent = "$(shell cleancss $^)";/' \
	    src/scratchblocks2.js

