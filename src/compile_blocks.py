#!/usr/bin/env python
"""Compile JS by adding block definitions from blocks*.txt, and extra JS from
diacritics.js. Dumps output to stdout.

"""

import os
import re
import json
import glob



def relpath(path):
    return os.path.join(os.path.dirname(__file__), path)



block_definitions = []

for fname in glob.glob(relpath("blocks*.txt")):
    for line in open(fname).readlines():
        line = line.strip()
        if line and not line.startswith("//"):
            block_definitions.append(line)

blocks = "\n".join(block_definitions)

js = open(relpath("scratchblocks2.js")).read()
js = js.replace('scratchblocks2.blocks = "";',
                'scratchblocks2.blocks = %s;' % json.dumps(blocks))
print js

print open(relpath("diacritics.js")).read()
