# Compile LESS to CSS
lessc src/scratchblocks2.less > build/scratchblocks2.css

# Compile and minify JS
uglifyjs src/scratchblocks2.js src/diacritics.js --comments --output build/scratchblocks2.js
