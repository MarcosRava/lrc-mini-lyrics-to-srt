var fs = require('fs');
var parser = require('subtitles-parser');

exports.fromLrcToSrt = fromLrcToSrt;

function fromLrcToSrt(pathToFile) {
  var ext = pathToFile.substring(pathToFile.lastIndexOf('.'), pathToFile.length);
  var srtFile = pathToFile.replace(ext, '.srt');
  if (fs.existsSync(srtFile)) return;
  var content = fs.readFileSync(pathToFile).toString();
  var regExp = /\[(.*?)\]/gi;
  var arr = content.split('\r\n');
  var str = '';
  var obj = [];
  var fakeobj = {};
  for (var i in arr) {
    var line = arr[i];
    var text = line.substring(line.lastIndexOf(']') +1, line.length);
    var times = line.match(regExp);
    for (var t in times) {
      var time = times[t].replace('[', '').replace(']', '');
      var split = time.split(':');
      var sec = split[0];
      var m = split[1].split('.');
      if (m.length < 2) continue;
      var mili = (+sec) * 1000 * 60 + (+m[0]) * 1000 + (+m[1]);
      if(fakeobj[mili]) fakeobj[mili].text = fakeobj[mili].text + text;
      else fakeobj[mili] = {text: text};
    }
  }
  for (var f in fakeobj) {
    obj.push({startTime: parseInt(f), text: fakeobj[f].text});
  }
  function compare(a,b) {
    if (a.startTime < b.startTime)
       return -1;
    if (a.startTime > b.startTime)
      return 1;
    return 0;
  }

  obj.sort(compare);
  for (var o in obj) {
    obj[o].id = (+o)+1;
    obj[o].endTime = obj[(+o)+1] ? obj[(+o)+1].startTime : obj[o].startTime + 10 * 1000;
  }
  var strContent = parser.toSrt(obj);
  if (strContent)
    fs.writeFileSync(srtFile, strContent);
}