# Compile LESS to CSS
lessc src/scratchblocks2.less > build/scratchblocks2.css

# Compile and minify JS
src/compile_blocks.py | uglifyjs - --comments --output build/scratchblocks2.js
