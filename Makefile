
version := $(shell git describe --tags)
all : commands translations js

clean :
	rm -r build
	rm src/translations.js
	rm src/translations-all.js

js-name := build/scratchblocks-$(version)-min.js
translations := build/translations-$(version)-min.js
translations_all := build/translations-all-$(version)-min.js
js : $(js-name) $(translations) $(translations_all)
$(js-name) : \
	    src/scratchblocks.js
	mkdir -p build/
	uglifyjs $^ > $@ --comments --mangle
$(translations) : src/translations.js
	uglifyjs $^ > $@ --comments
$(translations_all) : src/translations-all.js
	uglifyjs $^ > $@ --comments

zopfli :
	zopfli build/*.js

#css : src/defs.css
#	sed -i '' 's/var cssContent =.*/var cssContent = "$(shell cleancss $^)";/' \
#	    src/scratchblocks.js

commands : src/commands.js
	sh -c 'cd src ; python package_commands.py'

translations : \
	src/translations.js \
	src/translations-all.js

src/translations.js : src/extra_strings.py src/_cache src/commands.js src/build_translations.py
	sh -c 'cd src ; python build_translations.py'

src/translations-all.js : src/extra_strings.py src/_cache src/commands.js src/build_translations.py
	sh -c 'cd src ; python build_translations.py all'

