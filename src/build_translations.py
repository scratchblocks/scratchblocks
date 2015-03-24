#!/usr/bin/python
#coding=utf-8
from __future__ import unicode_literals

import codecs
import json
import os
import re

import urllib2
from urllib2 import urlopen

from extra_strings import extra_strings


ALL_LANGS = ["ar", "an", "hy", "ast", "eu", "bn_IN", "nb", "bg", "zh_CN",
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
FORUM_LANGS = ['de', 'es', 'fr', 'zh_CN', 'pl', 'ja', 'nl' , 'pt', 'it',
               'he', 'ko', 'nb', 'tr', 'el', 'ru', 'ca', 'id']

#LANGUAGES = ALL_LANGS
LANGUAGES = FORUM_LANGS

INSERT_RE = re.compile(r'(%[A-Za-z](?:\.[A-Za-z]+)?)')
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
            if msg_str and msg_id is not None:
                translations[msg_id] = msg_str
                msg_id = None
    return translations

def fetch_po(lang, project):
    filename = os.path.join("_cache", "{lang}-{project}.po".format(**vars()))
    if not os.path.exists("_cache"):
        os.mkdir("_cache")
    if os.path.exists(filename):
        return open(filename).read().decode("utf-8")
    name = (lang if project == "scratch1.4" else project)
    url = "http://translate.scratch.mit.edu/download/{lang}/{proj}/{name}.po"
    url = url.format(proj=project, **vars())
    print "GETing {url}".format(**vars())
    try:
        data = urlopen(url).read()
        open(filename, "w").write(data)
        return data.decode("utf-8")
    except urllib2.HTTPError, e:
        if e.code == 404:
            print "HTTP 404 not found:", url
            return ""
        raise

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

    blocks = minify_blocks(parse_po(fetch_po(lang, "scratch1.4")))
    blocks.update(minify_blocks(parse_po(fetch_po(lang, "blocks"))))

    editor = parse_po(fetch_po(lang, "editor"))

    if " < _" in blocks.get("when distance < _", []):
        when_distance, _ = blocks["when distance < _"].split(" < _")
    else:
        when_distance = None

    end_block = None
    extra_aliases = extra_strings.get(lang, {}).copy()
    for translated_text, english_text in extra_aliases.items():
        if english_text == "end":
            end_block = translated_text
            del extra_aliases[translated_text]
    for english_text in need_aliases:
        if english_text not in extra_aliases.values():
            print "%s is missing alias: %s" % (lang, english_text)

        image_pat = re.compile(r'@(arrow-c?cw|green-flag)')
        m = image_pat.search(english_text)
        unicode_images = {
            'green-flag': '⚑',
            'arrow-cw': '↻',
            'arrow-ccw': '↺',
        }
        symbol = unicode_images[m.group(1)]
        key = image_pat.sub('@', english_text)
        if key in blocks:
            translation = blocks[key]
            translation = translation.replace('@', symbol)
            extra_aliases[translation] = english_text

    blocks_list = []
    for blockid in english_blocks:
        if blockid in blocks:
            translation = blocks[blockid]
        elif blockid == "end":
            if end_block:
                translation = end_block
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

    palette = dict((x, blocks.get(x) or editor.get(x)) for x in [
        "Motion", "Looks", "Sound", "Pen", "Data", "variables", "variable",
        "lists", "list", "Events", "Control", "Sensing", "Operators",
        "More Blocks",
    ])
    palette['Tips'] = editor.get('Tips')

    language = {
        'code': lang,
        'aliases': extra_aliases,
        'define': [blocks.get('define', '')],
        'ignorelt': [when_distance],
        'math': map(editor.get, ["abs", "floor", "ceiling", "sqrt", "sin", 
                                 "cos", "tan", "asin", "acos", "atan", "ln",
                                 "log", "e ^", "10 ^"]),
        'palette': palette,
        'osis': [editor.get('other scripts in sprite', '')],
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
