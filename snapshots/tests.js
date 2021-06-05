const { test } = require("./runner")

// Scratch 2, English

test(
  "scratch2",
  "en-motion",
  `

// Motion

move (10) steps
turn cw (15) degrees
turn right (15) degrees
turn ↻ (15) degrees
turn ccw (15) degrees
turn left (15) degrees
turn ↺ (15) degrees

point in direction (90 v)
point towards [ v]

go to x: (0) y: (0)
go to [mouse-pointer v]
glide (1) secs to x: (0) y: (0)

change x by (10)
set x to (0)
change y by (10)
set y to (0)

if on edge, bounce

set rotation style [left-right v]

(x position)
(y position)
(direction)

`
)

test(
  "scratch2",
  "en-looks",
  `

// Looks

say [Hello!] for (2) secs
say [Hello!]
think [Hmm...] for (2) secs
think [Hmm...]

show
hide

switch costume to [costume1 v]
next costume
switch backdrop to [backdrop1 v]

change [color v] effect by (25)
set [color v] effect to (0)
clear graphic effects

change size by (10)
set size to (100)%

go to front
go back (1) layers

(costume #)
(backdrop name)
(size)

// (Stage-specific)

switch backdrop to [backdrop1 v] and wait
next backdrop

(backdrop #)

`
)

test(
  "scratch2",
  "en-sound",
  `

// Sound

play sound [pop v]
play sound [pop v] until done
stop all sounds

play drum (1 v) for (0.2) beats
rest for (0.2) beats

play note (60 v) for (0.5) beats
set instrument to (1 v)

change volume by (-10)
set volume to (100)%
(volume)

change tempo by (20)
set tempo to (60) bpm
(tempo)

`
)

test(
  "scratch2",
  "en-pen",
  `

// Pen

clear

stamp

pen down
pen up

set pen color to [#f0f]
change pen color by (10)
set pen color to (0)

change pen shade by (10)
set pen shade to (50)

change pen size by (1)
set pen size to (1)

`
)

test(
  "scratch2",
  "en-data",
  `

// Variables

set [var v] to [0]
change [var v] by (1)
show variable [var v]
hide variable [var v]

// List

add [thing] to [list v]

delete (1 v) of [list v]
insert [thing] at (1 v) of [list v]
replace item (1 v) of [list v] with [thing]

(item (1 v) of [list v])
(length of [list v])
<[list v] contains [thing]>

show list [list v]
hide list [list v]

`
)

test(
  "scratch2",
  "en-events",
  `

// Events

when gf clicked
when green flag clicked
when flag clicked
when ⚑ clicked
when [space v] key pressed
when this sprite clicked
when backdrop switches to [backdrop1 v]

when [loudness v] > (10)

when I receive [message1 v]
broadcast [message1 v]
broadcast [message1 v] and wait

`
)

test(
  "scratch2",
  "en-control",
  `

// Control

wait (1) secs

repeat (10)
end

forever
end

if <> then
end

if <> then
else
end

wait until <>

repeat until <>
end

// caps!

stop [all v]

stop [this script v]

// stack

stop [other scripts in sprite v]

stop [other scripts in stage v]

when I start as a clone
create clone of [myself v]
delete this clone

`
)

test(
  "scratch2",
  "en-sensing",
  `

// Sensing

<touching [ v]?>
<touching color [#f0f]?>
<color [#f0f] is touching [#0f0]?>
(distance to [ v])

ask [What's your name?] and wait
(answer)

<key [space v] pressed?>
<mouse down?>
(mouse x)
(mouse y)

(loudness)

(video [motion v] on [this sprite v])
turn video [on v]
set video transparency to (50)%

(timer)
reset timer

([x position v] of [Sprite1 v])

(current [minute v])
(days since 2000)
(username)
(user id)


`
)

test(
  "scratch2",
  "en-operators",
  `

// Operators

(() + ())
(() - ())
(() * ())
(() / ())

(pick random (1) to (10))

<[] < []>
<[] = []>
<[] > []>
&lt;[] &lt; []&gt;
&lt;[] &gt; []&gt;

<<> and <>>
<<> or <>>
<not <>>

(join [hello ] [world])
(letter (1) of [world])
(length of [world])

(() mod ())
(round ())

([sqrt v] of (9))

`
)

test(
  "scratch2",
  "en-extensions",
  `

// PicoBoard

when [button pressed v]

when [slider v] [> v] (50)

<sensor [button pressed v]?

([slider v] sensor value)

// Lego WeDo 1.0

turn [motor v] on for (1) secs

turn [motor v] on

turn [motor v] off

set [motor v] power to (100)

set [motor v] direction to [this way v]

when distance [< v] (20)

when tilt [= v] (20)

(distance)

(tilt)

// Lego WeDo 2.0

turn [motor v] on for (1) seconds

turn [motor v] on

turn [motor v] off

set [motor v] power to (100)

set [motor v] direction to [this way v]

set light color to (50)

play note (60 v) for (0.5) seconds

when distance [< v] (50)

when tilted

(distance)

(tilt [up-down v])

`
)

test(
  "scratch2",
  "en-obsolete",
  `

// Obsolete Scratch 1.4 blocks:


// Looks

switch to costume [costume1 v]

switch to background [background1 v]
next background
(background #)



// Control

if <>
end

forever if <>
end

stop script
stop all



// Events

when Sprite1 clicked



// Sensing

<loud?>



// Grey

. . .
...
…

`
)

/*****************************************************************************/

// Scratch 3, English

test(
  "scratch3",
  "en-motion",
  `

// Motion

move (10) steps
turn cw (15) degrees
turn ccw (15) degrees

go to (random position v)
go to x: (10) y: (0)
glide (1) secs to (random position v)
glide (1) secs to x: (10) y: (0)

point in direction (90)
point towards (mouse-pointer v)
change x by (10)
set x to (10)
change y by (10)
set y to (0)

if on edge, bounce

set rotation style [left-right v]

(x position)
(y position)
(direction)

`
)

test(
  "scratch3",
  "en-looks",
  `

// Looks

say [Hello!] for (2) seconds
say [Hello!]
think [Hmm...] for (2) seconds
think [Hmm...]

switch costume to (costume1 v)
next costume
switch backdrop to (backdrop1 v)
next backdrop

change size by (10)
set size to (100) %

change [color v] effect by (25)
set [color v] effect to (0)
clear graphic effects

show
hide

go to [front v] layer
go [forward v] (1) layers

(costume [number v])
(backdrop [number v])
(size)

`
)

test(
  "scratch3",
  "en-sound",
  `

// Sound

play sound (Meow v) until done
start sound (Meow v)
stop all sounds

change [pitch v] effect by (10)
set [pitch v] effect to (100)
clear sound effects

change volume by (-10)
set volume to (100) %

volume

`
)

test(
  "scratch3",
  "en-events",
  `

// Events

when flag clicked
when [space v] key pressed
when this sprite clicked
when backdrop switches to [backdrop1 v]

when [loudness v] > (10)

when i receive [message1 v]
broadcast (message1 v)
broadcast (message1 v) and wait

`
)

test(
  "scratch3",
  "en-control",
  `

// Control

wait (1) seconds

repeat (10)
end

forever
end

if <> then
end

if <> then
else
end

wait until <>

repeat until <>
end

stop [all v]

when I start as a clone
create clone of (myself v)
delete this clone 

`
)

test(
  "scratch3",
  "en-sensing",
  `

// Sensing

<touching (mouse-pointer v)?>
<touching color [#555]?>
<touching color (#555)?>
<color [#0f0] is touching [#f0f]?>
<color (#0f0) is touching (#f0f)?>
(distance to (mouse-pointer v))

ask [What's your name?] and wait

(answer)

<key (space v) pressed?>
<mouse down?>
(mouse x)
(mouse y)

set drag mode [draggable v]

(loudness)

(timer)
reset timer

([x position v] of (Stage v))

(current [year v])
(days since 2000)
(username)

`
)

test(
  "scratch3",
  "en-operators",
  `

// Operators

(() + ())
(() - ())
(() * ())
(() / ())

(pick random (1) to (10)

<() > (50)>
<() < (50)>
<() = (50)>

<<> and <>>
<<> or <>>
<not <>>

(join [apple] [banana])
(letter (1) of [apple])
(length of [apple])
<[apple] contains [a]?>

(() mod ())
(round ())

([abs v] of ())

`
)

test(
  "scratch3",
  "en-variables",
  `

// Variables

(foo)

set [foo v] to (0)
change [foo v] by (1)
show variable [foo v]
hide variable [foo v]

// Lists

(list)

add [thing] to [list v]
delete (1) of [list v]
delete all of [list v]
insert (1) at (1) of [list v]
replace item (1) of [list v] with (1)

(item (1) of [list v])
(item # of [thing] in [list v])
(length of [list v])
<[list v] contains [thing]?>

show list [list v]
hide list [list v]

`
)

test(
  "scratch3",
  "en-custom",
  `

// Custom

foo () if <>

define foo (num) if <bool>

`
)

test(
  "scratch3",
  "en-pen",
  `

// Pen

erase all

stamp

pen down
pen up

set pen color to [#f696e6]

change pen (color v) by (10)
set pen (color v) to (50)

change pen size by (1)
set pen size to (1)

`
)

test(
  "scratch3",
  "en-music",
  `

// Music

play drum (\\(1\\) Snare drum v) for (0.5) beats
rest for (0.25) beats
play note (60) for (0.25) beats
set instrument to (\\(1\\) Piano v)
set tempo to (60)
change tempo by (20)
(tempo)

`
)

test(
  "scratch3",
  "en-video",
  `

// Video

when video motion > (10)
(video (motion v) on (sprite v))
turn video (on v)
set video transparency to (50)

`
)

test(
  "scratch3",
  "en-extensions",
  `  
// Text-to-Sppech
speak [hello]
set voice to [alto v]

// Translate
(translate [hello] to [Thai v])
(language)

// Makey Makey
when [left up right v] pressed in order

// micro:bit
when [A v] button pressed
<[A v] button pressed?>
when [moved v]
display [heart v]
display text [Hello!]
clear display
when tilted [any v]
<tilted [any v]?>
(tilt angle [front v])
when pin [0 v] connected

// EV3
motor [A v] turn this way for (1) seconds
motor [A v] turn that way for (1) seconds
motor [A v] set power (100) %
(motor [A v] position)
when button [1 v] pressed
when distance \\< (5)
when brightness \\< (50)
<button [1 v] pressed?>
(brightness)
beep note (60) for (0.5) secs

// BOOST
turn motor [A v] for (1) seconds
turn motor [A v] for (1) rotations
turn motor [A v] on
turn motor [A v] off
set motor [ABCD v] speed to (100) %
set motor [A v] direction [this way v]
when [any color v] brick seen
<seeing [any color v] brick?>

// WeDo
turn [motor v] on for (1) seconds
turn [motor v] on
turn [motor v] off
set [motor v] power to (100)
set [motor v] direction to [this way v]
set light color to (50)
when distance [< v] (50)
(distance)

// Force and Acceleration
when [started falling v]
when force sensor [pushed v]
(force)
<falling?>
(spin speed [z v])
(acceleration [x v])
`
)

test(
  "scratch3",
  "en-cat",
  `
move (10) steps

when flag clicked :: cat
move (10) steps
`
)

/*****************************************************************************/

// Scratch 3, German

test(
  "scratch3",
  "de-motion",
  `

// Bewegung

gehe (10) er Schritt
drehe dich nach rechts um (15) Grad
drehe dich nach links um (15) Grad

gehe zu (Zufallsposition v)
gehe zu x: (10) y: (0)
gleite in (1) Sek. zu (Zufallsposition v)
gleite in (1) Sek. zu x: (0) y: (0)

setze Richtung auf (90) Grad
drehe dich zu (Mauszeiger v)
ändere x um (10)
setze x auf (10)
ändere y um (10)
setze y auf (0)

pralle vom Rand ab

setze Drehtyp auf [links-rechts v]

(x-Position)

(y-Position)

(Richtung)

`,
  "de"
)

test(
  "scratch3",
  "de-looks",
  `

// Aussehen

sage [Hallo!] für (2) Sekunden
sage [Hallo!]
denke [Hmm...] für (2) Sekunden
denke [Hmm...]

wechsle zu Kostüm (costume1 v)
wechsle zum nächsten Kostüm
wechsle zu Bühnenbild (backdrop1 v)
wechsle zum nächsten Bühnenbild

ändere Größe um (10)
setze Größe auf (100)

ändere Effekt [Farbe v] um (25)
setze Effekt [Farbe v] auf (0)
schalte Grafikeffekte aus

zeige dich
verstecke dich

gehe zu [vorderster v] Ebene
gehe (1) Ebenen [nach vorne v]

(Kostüm [Nummer v])

(Bühnenbild [Nummer v])

(Größe)

`,
  "de"
)
// "gehe Ebenen nach vorne" appears differently in the Scratch editor than in
// the translation files, wut

test(
  "scratch3",
  "de-sound",
  `

// Klang

spiele Klang (Meow v) ganz
spiele Klang (Meow v)
stoppe alle Klänge

ändere Effekt [Höhe v] um (10)
setze Effekt [Höhe v] auf (100)
schalte Klangeffekte aus

ändere Lautstärke um (-10)
setze Lautstärke auf (100) %

(Lautstärke :: sound)


`,
  "de"
)

test(
  "scratch3",
  "de-events",
  `

// Ereignisse

Wenn die grüne Flagge angeklickt
Wenn Taste [Leertaste v] gedrückt wird
Wenn diese Figur angeklickt wird
Wenn das Bühnenbild zu [backdrop1 v] wechselt

Wenn [Lautstärke v] > (10)

Wenn ich [Nachricht1 v] empfange
sende (Nachricht1 v) an alle
sende (Nachricht1 v) an alle und warte

`,
  "de"
)

test(
  "scratch3",
  "de-control",
  `

// Steuerung

warte (1) Sekunden

wiederhole (10) mal
Ende

wiederhole fortlaufend
Ende

falls <>, dann
Ende

falls <>, dann
Ende

warte bis <>

wiederhole bis <>
Ende

stoppe [andere Skripte der Figur v]
stoppe [alles v]

Wenn ich als Klon entstehe
erzeuge Klon von (mir selbst v)
lösche diesen Klon

`,
  "de"
)

test(
  "scratch3",
  "de-sensing",
  `

// Fühlen

<wird (Mauszeiger v) berührt?>
<wird Farbe [#555] berührt?>
<Farbe [#0f0] berührt [#f0f] ?>
(Entfernung von (Mauszeiger v))

frage [Wie heißt du?] und warte

(Antwort)

<Taste (Leertaste v) gedrückt?>
<Maustaste gedrückt?>
(Maus x-Position)
(Maus y-Position)

setze Ziehbarkeit auf [ziehbar v]

(Lautstärke)

(Stoppuhr)
setze Stoppuhr zurück

([x-Position v] von (Buehne v))
([x-Position v] von (foo))

([Jahr v] im Moment)
(Tage seit 2000)
(Benutzername)

`,
  "de"
)

test(
  "scratch3",
  "de-operators",
  `

// Operatoren

(() + ())
(() - ())
(() * ())
(() / ())

(Zufallszahl von (1) bis (10)

<() > (50)>
<() < (50)>
<() = (50)>

<<> und <>>
<<> oder <>>
<nicht <>>

(verbinde [Apfel] und [Banane])
(Zeichen (1) von [Apfel])
(Länge von [Apfel])
<[apple] enthält [a]?>

(() mod ())
(() gerundet)

([Betrag v] von (10))
([Betrag v] von (foo))

`,
  "de"
)

test(
  "scratch3",
  "de-variables",
  `

// Variablen

(foo)

setze [foo v] auf (0)
ändere [foo v] um (1)
zeige Variable [foo v]
verstecke variable [foo v]

// Liste

(list)

füge [Ding] zu [list v] hinzu
lösche (1) aus [list v]
lösche alles aus [list v]
füge (1) bei (1) in [list v] ein
ersetze Element (1) von [list v] durch (1)

(Element (1) von [list v])
(Nummer von [Ding] in [list v])
(Länge von [list v])
<[list v] enthält [Ding] ?>

zeige Liste [list v]
verstecke Liste [list v]

`,
  "de"
)

test(
  "scratch3",
  "de-custom",
  `

// Meine Blöcke

foo () if <>

Definiere foo (num) if <bool>

`,
  "de"
)

test(
  "scratch3",
  "de-pen",
  `

// Malstift

lösche alles

hinterlasse Abdruck

schalte Stift ein
schalte Stift aus

setze Stiftfarbe auf [#f696e6]

ändere Stift (Farbe v) um (10)
setze Stift (Farbe v) auf (50)

ändere Stiftdicke um (1)
setze Stiftdicke auf (1)

`,
  "de"
)

test(
  "scratch3",
  "de-music",
  `

// Musik

spiele Schlaginstrument (\\(1\\) Snare-Drum v) für (0.5) Schläge
pausiere (0.25) Schläge
spiele Ton (60) für (0.25) Schläge
setze Instrument auf (\\(1\\) Klavier v)
setze tempo auf (60)
ändere Tempo um (20)

(Tempo)

`,
  "de"
)

test(
  "scratch3",
  "de-video",
  `

// Video-Erfassung

Wenn Video-Bewegung > (10)

(Video- (Bewegung v) von (Figur v))

schalte Video (an v)
setze Video-Transparenz auf (50)

`,
  "de"
)

test(
  "scratch3",
  "de-extensions",
  `
// Text zu Sprache

sage [Hallo]
ändere die Stimme zu (Alt v)
setze Sprache auf (English v)

// Übersetzung

(übersetze [Hallo] nach (Malaysisch v))
(Sprache)

// Makey Makey
Wenn [nach links nach oben nach rechts v] der Reihe nach gedrückt

// micro:bit
Wenn Knopf [A v]gedrückt wird
<Knopf [A v] gedrückt? >
Wenn [bewegt v]
zeige [heart v] an
zeige Text [Hallo!] an
zeige nichts an
Wenn [beliebiger v] geneigt
<[beliebig v] geneigt?>
(Neigungswinkel [nach vorne v])
Wenn Pin [0 v] angeschlossen ist

// EV3
drehe Motor [A v] für (1)Sekunden rechtsherum
drehe Motor [A v]für (1)Sekunden linksherum
setze Leistung von Motor [A v] auf (100)%

// Commented out until disambiguation issue can be fixed
// (Position von Motor [A v])
Wenn der Knopf [a v] gedrückt wird
Wenn Abstand \\< (5)
Wenn Helligkeit \\< (50)
<Knopf [1 v] gedrückt?>
(Helligkeit)
piepse Note (60) für (0.5) Sek.

// BOOST
Schalte Motor [A v] für (1) Sekunden ein
Schalte Motor [A v] für (1) Umdrehungen ein
Schalte Motor [A v] ein
Schalte Motor [A v] aus
Setze von Motor [A v] die Geschwindigkeit auf (100)%
Setze Richtung von Motor [A v] auf [linksherum v]
Wenn [Irgendeine Farbe v] gesehen wird
<Sehe Farbe [Irgendeine Farbe v]?>

// WeDo
schalte [Motor v] für (1) Sekunden an
schalte [Motor v] an
schalte [Motor v] aus
setze Leistung von [Motor v] auf (100)
setze Richtung von [Motor v] auf [linksherum v]
setze Lichtfarbe auf (50)
Wenn Abstand [< v] (50)
(Abstand)

// Force and Acceleration
Wenn [begonnen zu fallen v]
Wenn Kraftsensor [gedrückt v]
(Kraft)
<fallend?>
(Rotationsgeschwindigkeit [z v])
(Beschleunigung [x v])
`,
  "de"
)