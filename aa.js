var scratchblocks = require('./')

var code = `
when flag clicked
clear
forever
pen down
if <<mouse down?> and <touching [mouse-pointer v]?>> then
switch costume to [button v]
else
add (x position) to [list v]
end
move (foo) steps
turn ccw (9) degrees`;

var svg = scratchblocks(code)

console.log(svg);
