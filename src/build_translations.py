#!/usr/bin/python
#coding=utf-8
from __future__ import unicode_literals, division

import codecs
import json
import os
import re
import sys
from io import open  # open -> str for both python 2.x and 3.x
from copy import copy

try:
    from urllib2 import HTTPError
    from urllib2 import urlopen
except ImportError:
    from urllib.error import HTTPError
    from urllib.request import urlopen

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

langs = "forum"
if len(sys.argv) > 1:
    if sys.argv[1] == "--help":
        print("\nA tool for combining and packaging scratch translations.")
        print("\n  Usage: python build_translations.py [--help] [all]")
        exit()
    if sys.argv[1] == "all":
        langs = "all"

if langs == "all":
    LANGUAGES = ALL_LANGS
else:
    LANGUAGES = FORUM_LANGS

INSERT_RE = re.compile(r'(%[A-Za-z](?:\.[A-Za-z]+)?)')
PICTURE_RE = re.compile(r'@[A-Za-z-]+')
JUNK_RE = re.compile(r'[ \t,\%?:]')

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
        return open(filename, encoding='utf-8').read()
    name = (lang if project == "scratch1.4" else project)
    url = "http://translate.scratch.mit.edu/download/{lang}/{proj}/{name}.po"
    url = url.format(proj=project, **vars())
    print("GETing {url}".format(**vars()))
    try:
        data = urlopen(url).read().decode('utf-8')
        open(filename, "w", encoding="utf-8").write(data)
        return data
    except HTTPError as e:
        if e.code == 404:
            print("HTTP 404 not found:", url)
            return ""
        raise

all_languages = {}

# Get spec list from JS
english_commands = json.loads('{"commands":' + open('commands.js').read().rstrip(";\n],") + ']]}')["commands"]
command_specs = [c[0] for c in english_commands]

# Prepare blocks lists
untranslated = set([
    "%n + %n",
    "%n - %n",
    "%n * %n",
    "%n / %n",
    "%s < %s",
    "%s = %s",
    "%s > %s",
    "…",
    "..."
])
acceptable_missing = set([
    "username",
])
need_aliases = [
    "turn @turnRight %n degrees",
    "turn @turnLeft %n degrees",
    "when @greenFlag clicked",
]

math_funcs = ["abs", "floor", "ceiling", "sqrt", "sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "e ^", "10 ^"]
osis = ["other scripts in sprite", "other scripts in stage"]

dropdown_values = ["A connected", "all", "all around", "all motors",
    "B connected", "brightness", "button pressed", "C connected", "color",
    "costume name", "D connected", "date", "day of week", "don't rotate",
    "down arrow", "edge", "everything", "fisheye", "ghost", "hour",
    "left arrow", "left-right", "light", "lights", "minute", "month",
    "mosaic", "motion", "motor", "motor A", "motor B", "mouse-pointer",
    "myself", "not =", "off", "on", "on-flipped", "other scripts in sprite",
    "pixelate", "previous backdrop", "random position", "resistance-A",
    "resistance-B", "resistance-C", "resistance-D", "reverse", "right arrow",
    "second", "slider", "sound", "space", "Stage", "that way", "this script",
    "this sprite", "this way", "up arrow", "video motion", "whirl", "year",
    ]

def nonempty(seq):
    return list(set(filter(None, seq)))

for lang in LANGUAGES:
    if lang in BLACKLIST: continue
    print(lang)

    lang_blocks = parse_po(fetch_po(lang, "blocks"))
    lang_editor = parse_po(fetch_po(lang, "editor"))
    extra_aliases = extra_strings.get(lang, {}).copy()

    when_distance = None
    if " < %n" in lang_blocks.get("when distance < %n", ""):
        when_distance, _ = lang_blocks["when distance < %n"].split(" < %n")

    end_block = None
    for translated_text, english_spec in copy(extra_aliases).items():
        if english_spec == "end":
            end_block = translated_text
            del extra_aliases[translated_text]

    for english_spec in need_aliases:
        if english_spec not in extra_aliases.values():
            print("%s is missing alias: %s" % (lang, english_spec))

    count = 0
    commands = {}
    for spec in command_specs:
        if spec == "end":
            lang_spec = end_block or ""
        else:
            lang_spec = (lang_blocks.get(spec)
                or lang_blocks.get(spec.replace("%m.location", "%m.spriteOrMouse"))
            )
        if lang_spec:
            commands[spec] = lang_spec
            count += 1
        else:
            if spec == "end":
                print("%s is missing extra: end" % lang)
            elif spec not in untranslated and spec not in acceptable_missing:
                print("%s is missing: %s" % (lang, spec))
    print("{}: {:.1f}%".format(lang, count/len(command_specs)*100))

    dropdowns = {}
    for name in dropdown_values:
        native_name = lang_blocks.get(name) or lang_editor.get(name, '')
        if native_name:
            dropdowns[name] = native_name

    language = {
        'aliases': extra_aliases,
        'define': [lang_blocks.get('define', '')],
        'ignorelt': [when_distance],
        'math': nonempty(map(lang_editor.get, math_funcs)),
        'osis': nonempty(map(lang_editor.get, osis)),
        'commands': commands,
        'dropdowns': dropdowns,
    }
    all_languages[lang] = language

block_ids = []
some_language_translations = list(all_languages.values())[0]
for bid in some_language_translations.keys():
    if not bid[0].isupper(): # Assume upper-case are category names
        block_ids.append(bid)

translations_array = []
translations_array.append([None] + block_ids)
for lang, translations in all_languages.items():
    language_array = [lang]
    for bid in block_ids:
        if bid not in translations:
            print("%s doesn't have %s" % (lang, bid))
        language_array.append(translations.get(bid, ''))
    translations_array.append(language_array)

    #open("blocks-%s.js" % lang, "w").write(json.dumps(language_array,
    #    ensure_ascii=False))

encoded = json.dumps(all_languages, ensure_ascii=False, indent=2)
data = "scratchblocks.loadLanguages({});".format(encoded)
if langs == 'all':
    filename = "translations-all.js"
else:
    filename = "translations.js"
open(filename, "wb").write(data.encode("utf-8"))
print("Wrote %s" % filename)
