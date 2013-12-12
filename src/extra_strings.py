# coding=utf-8
from __future__ import unicode_literals

"""
We need extra translations for the following strings that aren't included on
translate.scratch.mit.edu:
 
 - "turn left 10 degrees"
 - "turn right 10 degrees"
 - "when green flag clicked"
 - "end" (written after a "C" block)

"""

extra_strings_defns = {

    None: [
        "turn @arrow-ccw _ degrees",
        "turn @arrow-cw _ degrees",
        "when @green-flag clicked",
        "end",
    ],

    "de": [ # German
        "drehe dich nach links um _ Grad",
        "drehe dich nach rechts um _ Grad",
        "Wenn die grüne Flagge angeklickt",
        "Ende",
    ],

    "pt": [ # Portugese
        "gira para a esquerda _ º",
        "gira para a direita _ º",
        "Quando alguém clicar na bandeira verde",
        "fim",
    ],

    "it": [ # Italian
        "ruota in senso antiorario di _ gradi",
        "ruota in senso orario di _ gradi",
        "quando si clicca sulla bandiera verde",
        "fine",
    ],

    "fr": [ # French
        "tourner gauche de _ degrés",
        "tourner droite de​ ​_ degrés",
        "quand le drapeau vert pressé",
        "fin",
    ],

    "es": [ # Spanish
        "girar a la izquierda _ grados",
        "girar a la derecha _ grados",
        "al presionar bandera verde",
        "fin",
    ],

    "nl": [ # Dutch
        "draai _ graden naar links",
        "draai _ graden naar rechts",
        "wanneer groene vlag wordt aangeklikt",
        "einde",
    ],

    "zh_CN": [ # Chinese (simplified)
        "转动CCW _度",
        "转动CW _度",
        "点击绿旗时",
        "结束",
    ],

    "he": [ # Hebrew
        "הסתובב שמאל _ מעלות",
        "הסתובב ימינה _ מעלות",
        "כאשר לוחצים על דגל ירוק",
        "סוף",
    ],

}

extra_strings = {}
for (lang, defn) in extra_strings_defns.items():
    if lang is None: continue
    extra_strings[lang] = dict(zip(extra_strings_defns[None], defn))

