#!/usr/bin/python
#coding=utf-8
from __future__ import unicode_literals

import codecs
import json
import re

import requests

from extra_strings import extra_strings


LANGUAGES = ["ar", "an", "hy", "ast", "eu", "bn_IN", "nb", "bg", "zh_CN",
             "zh_TW", "da", "de", "eo", "et", "fo", "fi", "fr", "fr_CA", "gl",
             "ht", "he", "hi", "hch", "id", "ga", "is", "it", "ja", "ja_hr",
             "ja_HIRA", "km", "kn", "kk", "ca", "ko", "hr", "ku", "cy", "ky",
             "la", "lv", "lt", "mk", "ms", "ml", "mr", "maz", "mn", "my",
             "nah", "ne", "el", "nl", "no", "nn", "or", "os", "oto", "ote",
             "pap", "fa", "fil", "pl", "pt", "pt_BR", "ro", "ru", "rw", "sv",
             "sr", "sk", "sl", "es", "sw", "tzm", "ta", "th", "cs", "tr", "ug",
             "uk", "hu", "vi"]

BLACKLIST = set(["or"])

# ISO Codes for all the language forums.
LANGUAGES = ['de', 'es', 'fr', 'zh_CN', 'pl', 'ja', 'nl' , 'pt', 'it', 'he',
             'ko', 'nb', 'tr', 'el', 'ru', 'ca', 'id']

INSERT_RE = re.compile(r'(%.(?:\.[A-z]+)?)')
PICTURE_RE = re.compile(r'@[A-Za-z-]+')
JUNK_RE = re.compile(r'[ \t,\%?:]')

def minify(spec):
    #spec = spec.lower()
    #spec = JUNK_RE.sub("", spec)
    return spec

def minify_blockspec(spec):
    spec = INSERT_RE.sub("_", spec)
    spec = PICTURE_RE.sub("@", spec)
    return minify(spec)

def minify_blocks(blocks):
    mini_blocks = {}
    for block, result in blocks.items():
        assert "_" not in block
        mini_blocks[minify_blockspec(block)] = minify_blockspec(result)
    return mini_blocks

def parse_po(content):
    msg_id = None
    translations = {}
    for line in content.split("\n"):
        if line.startswith("msgid "):
            msg_id = line[6:].strip().strip('"')
        elif line.startswith("msgstr "):
            msg_str = line[7:].strip().strip('"')
            if msg_str:
                assert msg_id
                translations[msg_id] = msg_str
                msg_id = None
    return translations

def fetch_po(lang, project):
    filename = (lang if project == "scratch1.4" else project)
    url = "http://translate.scratch.mit.edu/{lang}/{proj}/{name}.po/download/"
    url = url.format(lang=lang, proj=project, name=filename)
    r = requests.get(url)
    return r.content.decode("utf-8")

language_translations = {}

# Get blockids list from scratchblocks2
js_lines = map(unicode.strip, codecs.open("scratchblocks2.js",
                                          encoding="utf-8").readlines())
start = js_lines.index("var english_blocks = [")
end = js_lines.index("];", start)
block_lines = js_lines[start+1:end]
parsed_lines = [json.loads(line.rstrip(",")) for line in block_lines
                if line and not line.startswith("//")]
english_blocks = [l[0] for l in parsed_lines if len(l) > 1]

# Prepare blocks lists
english_blocks = map(minify_blockspec, english_blocks)
untranslated = set(["_ + _", "_ - _", "_ * _", "_ / _", "_ < _", "_ = _",
                    "_ > _", "…", "..."])
acceptable_missing = set(["username"])
need_aliases = [
    "turn @arrow-ccw _ degrees",
    "turn @arrow-cw _ degrees",
    "when @green-flag clicked",
]

for lang in LANGUAGES:
    if lang in BLACKLIST: continue
    print lang

    blocks = parse_po(fetch_po(lang, "scratch1.4"))
    blocks.update(parse_po(fetch_po(lang, "blocks")))
    blocks = minify_blocks(blocks) 

    editor = parse_po(fetch_po(lang, "editor"))

    if "<" in blocks["when distance < _"]:
        when_distance, _ = blocks["when distance < _"].split(" < _")
    else:
        when_distance = None

    extra = extra_strings.get(lang, {})

    blocks_list = []
    for blockid in english_blocks:
        if blockid in blocks:
            translation = blocks[blockid]
        elif blockid == "end":
            if blockid in extra:
                translation = extra[blockid]
            else:
                translation = ""
                print "%s is missing extra: end" % lang
        else:
            if blockid in untranslated or blockid in acceptable_missing:
                translation = ""
            else:
                print "%s is missing: %s" % (lang, blockid)
                translation = "" # DEBUG

        blocks_list.append(translation)

    aliases = {}
    for alias in need_aliases:
        if alias in extra:
            aliases[extra[alias]] = alias
        else:
            print "%s is missing alias: %s" % (lang, alias)

    language = {
        'code': lang,
        'aliases': aliases,
        'define': blocks['define'],
        'ignorelt': [when_distance],
        'math': map(editor.get, ["abs", "floor", "ceiling", "sqrt", "sin", 
                                 "cos", "tan", "asin", "acos", "atan", "ln",
                                 "log", "e ^", "10 ^"]),
        'osis': editor['other scripts in sprite'],
        
        'blocks': blocks_list,
    }
    language_translations[lang] = language

block_ids = []
some_language_translations = language_translations.values()[0]
for bid in some_language_translations.keys():
    if not bid[0].isupper(): # Assume upper-case are category names
        block_ids.append(bid)

translations_array = []
translations_array.append([None] + block_ids)
for lang, translations in language_translations.items():
    language_array = [lang]
    for bid in block_ids:
        if bid not in translations:
            print "%s doesn't have %s" % (lang, bid)
        language_array.append(translations.get(bid, ''))
    translations_array.append(language_array)

    #open("blocks-%s.js" % lang, "w").write(json.dumps(language_array,
    #    ensure_ascii=False))

data = "scratchblocks2._translations = "
data += json.dumps(language_translations, ensure_ascii=False)
data += ";"
open("translations.js", "wb").write(data.encode("utf-8"))
print "Wrote translations.js"
