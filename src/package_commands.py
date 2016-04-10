import regex

ws = regex.compile(r'( )+')
contents = open('commands.js').read().replace("\n", " ")
encoded, _ = ws.subn(lambda x: x.group(1), contents)

sc = regex.compile(r'var scratchCommands = (.*)')
js = open('scratchblocks.js', 'r').read()
js = sc.sub("var scratchCommands = {}".format(encoded), js)
open('scratchblocks.js', 'w').write(js)

