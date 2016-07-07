var s = require('./')()
var fs = require('fs')

var doc = s.parse(`
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
turn ccw (9) degrees`);

s.render(doc, (res) => {
  res = res.toString()
  res = res.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  fs.writeFileSync('aa.svg', res)
});
