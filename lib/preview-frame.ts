require("../css/preview-frame.css");

declare interface PreviewFrameWindow extends PreviewFrame {
  // This is exported by p5 when it's in global mode.
  noLoop: () => void;
}

var global = window as PreviewFrameWindow;

function loadP5(version: string, cb?: () => void) {
  var url = '//cdnjs.cloudflare.com/ajax/libs/p5.js/' + version + '/p5.js';
  var script = document.createElement('script');

  cb = cb || function() {};

  script.onload = cb;
  script.setAttribute('src', url);

  document.body.appendChild(script);
}

function LoopChecker(sketch: string, funcName: string, maxRunTime: number) {
  var self = {
    wasTriggered: false,
    getLineNumber() {
      var index = loopCheckFailureRange[0];
      var line = 1;

      for (var i = 0; i < index; i++) {
        if (sketch[i] === '\n')
          line++;
      }

      return line;
    }
  };
  var startTime = Date.now();
  var loopCheckFailureRange = null;

  global[funcName] = function(range) {
    if (Date.now() - startTime > maxRunTime) {
      self.wasTriggered = true;
      loopCheckFailureRange = range;
      throw new Error("Loop took over " + maxRunTime + " ms to run");
    }
  };

  setInterval(function() {
    startTime = Date.now();
  }, maxRunTime / 2);

  return self;
}

function startSketch(sketch: string, p5version: string, maxRunTime: number,
                     loopCheckFuncName: string,
                     errorCb: PreviewFrameErrorReporter) {
  var sketchScript = document.createElement('script');
  var loopChecker = LoopChecker(sketch, loopCheckFuncName, maxRunTime);

  sketchScript.textContent = sketch;

  global.addEventListener('error', function(e: ErrorEvent) {
    var message = e.message;
    var line = undefined;

    if (loopChecker.wasTriggered) {
      message = "Your loop is taking too long to run.";
      line = loopChecker.getLineNumber();
    } else if (typeof(e.lineno) === 'number' &&
              (e.filename === '' || e.filename === window.location.href)) {
      line = e.lineno;
    }

    // p5 sketches don't actually stop looping if they throw an exception,
    // so try to stop the sketch.
    try { global.noLoop(); } catch (e) {}

    errorCb(message, line);
  });

  document.body.appendChild(sketchScript);

  loadP5(p5version);
}

global.startSketch = startSketch;
