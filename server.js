var http = require('http');
var fs = require('fs');

var helloString = "{{ user_defined.welcome_msg }} <br />. My hostname at the time of the rendering was: {{ facts.hostname }}";
var dataFile = '{{ user_defined.data_file }}';
var connectionCount = 0;

function logVisitorData(ipAddress, date) {
  var stringToWrite = ipAddress + '|'  + date + '\n';
  var stream = fs.createWriteStream(dataFile, {'flags': 'a'});
  stream.write(stringToWrite, 'utf8');
}

function getVisitorsString(callback) {
  var data = '';
  var stream = fs.createReadStream(dataFile);

  stream.on('data', function(chunk) {
    data += chunk;
  });

  stream.on('error', function(err) {
    callback('');
  });

  stream.on('end', function() {
    var i, visitors, visitor, split;
    var returnData = '';
    var visitors = data.split('\n');

    for (i = 0; i < visitors.length; i++) {
      visitor = visitors[i];
      split = visitor.split('|');

      if (split.length != 2) {
        continue;
      }

      returnData += split[1] + ': ' + split[0] + '<br />';
    }

    callback(returnData);
  });
}

http.createServer(function (req, res) {
  var ipAddress = req.socket.remoteAddress;
  var date = new Date();
  var msgString = helloString;

  connectionCount++;
  console.log('Client ' + connectionCount + ' (' + ipAddress + ') connected.');
  getVisitorsString(function inVisitorData(visitors) {
    res.writeHead(200, {'Content-Type': 'text/html'});

    msgString += '<br /> Previous visitors: <br />';
    msgString += visitors;
    res.end(msgString);
  });

  logVisitorData(ipAddress, date);
}).listen({{ user_defined.server_port }}, "0.0.0.0");
