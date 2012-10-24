

//require('nodetime').profile();

var fs        = require("fs");          // file reading
var zlib      = require('zlib');        // for compression if desired.
var UglifyJS  = require("uglify-js2");  // for minification if desired

function _combine(fileOrFiles, options){
  var combined = "";
  var combinedGZip = "";
  var combinedDeflate = "";
  var runRequested = false;
  var files = [];
  var lastModifiedDate = new Date();
  if(typeof fileOrFiles === "string"){
    files.push(fileOrFiles);
  }else{
    files = fileOrFiles;
  }
  function logr(msg, err){
    if(options.verbose){
      console.log("scrunch: "+msg);
      if(err){
        console.log(err);
      }
    }
  }
  function run(){
    var contents  = "";
    var fileIndex = 0;
    function loadNextFile(){
      if(fileIndex < files.length){
        var index = fileIndex++;
        fs.readFile(files[index], function (err, data) {
          if(err){
            logr("Error loading file (details follow).");
            logr("Update aborted for: "+files[index], err);
            return;
          }
          var addon = "";
          if(options.comment){
            addon += "\n";
            addon += "//---------------------------------------\n";
            addon += "// "+files[index]+"\n";
            addon += "//---------------------------------------\n";
          }
          contents += addon+data+"\n";
          return loadNextFile();
        });
      }else{
        // done loading all files.
        if(options.minifyJS){
          try{
            var result = UglifyJS.minify(contents, {fromString: true});
            //var result = _minify(contents);
            combined   = result.code; 
          }catch(ex){
            logr("JS parse error during minify");
          }
        }else{
          combined = contents;
        }
        zlib.gzip(combined, function(err, result){
          if(err) return logr("Error compressing to gzip");
          combinedGZip = result;
        });
        zlib.deflate(combined, function(err, result){
          if(err) return logr("Error compressing to deflate");
          combinedDeflate = result;
        });
        lastModifiedDate = (new Date()).toUTCString();
        var size = (contents.length/1024).toFixed(2);
        if(options.compress){
          size = "~"+((contents.length/1024)*0.32).toFixed(0);
        }
        logr(files.length+" files combined -- "+((options.minifyJS)?"minified":"raw")+"/"+((options.compress)?"compressed":"uncompressed")+": "+size+"kB");
      }
    }
    loadNextFile();  
  }
  function addWatches(){
    for(var i=0; i<files.length; i++){
      fs.watchFile(files[i], {persistent: true, interval: options.refresh||5007}, function (curr, prev) {
        if(curr.mtime !== prev.mtime){
          runRequested = true;
        }
      });
    }
  }
  function loop(){
    if(runRequested){
      runRequested = false;
      run();
    }
  }
  setInterval(loop, options.refresh||5007);
  run();
  addWatches();
  function setHeader(res){
    res.setHeader('Date', (new Date()).toUTCString());
    res.setHeader('Cache-Control', 'public, max-age=' + ((options.maxAge||0) / 1000));
    res.setHeader('Content-Type', (options.type||'text/javascript; charset=utf8'));
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('Last-Modified', lastModifiedDate);
  }
  return function(req, res, next){
    if(req.headers['if-modified-since'] && req.headers['if-modified-since'] === lastModifiedDate){
      // send Not Modified response.
      res.writeHead(304, {});
      return res.end();
    }
    setHeader(res);
    if(options.compress){
      var acceptEncoding = req.headers['accept-encoding'];
      if (!acceptEncoding) {
        acceptEncoding = '';
      }
      if (acceptEncoding.match(/\bgzip\b/)) {
        res.writeHead(200, {'content-encoding': 'gzip'});
        res.end(combinedGZip);
      } else if (acceptEncoding.match(/\bdeflate\b/)) {
        res.writeHead(200, {'content-encoding': 'deflate'});
        res.end(combinedDeflate);
      } else {
        res.writeHead(200, {});
        res.end(combined);
      }
    }else{
      res.writeHead(200, {});
      res.end(combined);
    }
  };
}

module.exports.combine = _combine;
