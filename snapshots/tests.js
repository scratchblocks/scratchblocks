const { test } = require("./runner")

test(
  "scratch2",
  "motion",
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
  "looks",
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
  "sound",
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
  "pen",
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
  "data",
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
  "events",
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
  "control",
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
  "sensing",
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
  "operators",
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
  "extensions",
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
  "obsolete",
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

test(
  "scratch3",
  "motion",
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
  "looks",
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
  "sound",
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
  "events",
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
  "control",
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
  "sensing",
  `

// Sensing

<touching (mouse-pointer v)?>
<touching color [#555]?>
<touching color (#555)?>
<color [#0f0] is touching [#f0f]?>
<color (#0f0) is touching (#f0f)?>
(distance to (mouse-pointer v))

ask (What's your name?) and wait

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
  "operators",
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

(join (apple) (banana))
(letter (1) of (apple))
(length of (apple))
<(apple) contains (a)?>

(() mod ())
(round ())

([abs v] of ())

`
)

test(
  "scratch3",
  "variables",
  `

// Variables

(foo)

set [foo v] to (0)
change [foo v] by (1)
show variable [foo v]
hide variable [foo v]

// Lists

(list)

add (thing) to [list v]
delete (1) of [list v]
delete all of [list v]
insert (1) at (1) of [list v]
replace item (1) of [list v] with (1)

(item (1) of [list v])
(item # of (thing) in [list v])
(length of [list v])
<[list v] contains (thing)?>

show list [list v]
hide list [list v]

`
)

test(
  "scratch3",
  "custom",
  `

// Custom

foo () if <>

define foo (num) if <bool>

`
)

test(
  "scratch3",
  "pen",
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
  "music",
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
  "video",
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
  "extensions",
  `
// Text to Speech

speak (hello) :: tts
set voice to (alto v) :: tts
set language to (English v) :: tts

// Translate

(translate (hello) to (Galician v) :: translate)
(language :: translate)

// Makey Makey

when (space v) key pressed :: makeymakey hat
when (left up right v) pressed in order :: makeymakey hat

// micro:bit

when (A v) button pressed :: microbit hat
<(A v) button pressed? :: microbit>

when (moved v) :: microbit hat

display (♥ v) :: microbit
display text [Hello!] :: microbit
clear display :: microbit

when tilted (any v) :: microbit hat
<tilted (any v)? :: microbit>
(tilt angle (front v) :: microbit)

when pin (0 v) connected :: microbit hat

// LEGO EV3

motor (A v) turn this way for (1) seconds :: ev3
motor (A v) turn that way for (1) seconds :: ev3
motor (A v) set power (100)% :: ev3
(motor (A v) position :: ev3)
when button (1 v) pressed :: ev3 hat
when distance \\< (5) :: ev3 hat
when brightness \\< (50) :: ev3 hat
<button (1 v) pressed? :: ev3>
(distance :: ev3)
(brightness :: ev3)
beep note (60) for (0.5) secs :: ev3

// WeDo 2.0

turn (motor v) on for (1) seconds :: wedo
turn (motor v) on :: wedo
turn (motor v) off :: wedo
set (motor v) power to (100) :: wedo
set (motor v) direction to (this way v) :: wedo
set light color to (50) :: wedo
when distance (\\< v) (50) :: wedo
when tilted (any v) :: wedo
(distance :: wedo)
<tilted (any v)? :: wedo>
(tilt angle (up v) :: wedo)
`
)
