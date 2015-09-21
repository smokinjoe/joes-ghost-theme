/**
 * Main JS file for Casper behaviours
 */

/* globals jQuery, document */
(function ($, undefined) {
  "use strict";

  var TRIGGER_CLICK = 'click',
      TRIGGER_HOVER = 'hover',
      TRIGGER_AUTO = 'auto',
      TRIGGER_DEFAULT = TRIGGER_CLICK;

  var Ajax = (function (opts) {
    var opts = opts || {},
        params = opts.params || {},
        callback = opts.callback || new Function(),
        errCb = opts.err || new Function(),
        url = opts.url,
        method = opts.method || 'GET',
        methods = {};

    methods.call = function (opts) {
      $.ajax({
        url: url,
        type: method,
        data: params
      }).done(callback).fail(errCb);
    };


        /*
          var parser = document.createElement('a');
          parser.href = "http://example.com:3000/pathname/?search=test#hash";
          parser.protocol; // => "http:"
          parser.hostname; // => "example.com"
          parser.port;     // => "3000"
          parser.pathname; // => "/pathname/"
          parser.search;   // => "?search=test"
          parser.hash;     // => "#hash"
          parser.host;     // => "example.com:3000"
        */
    methods.parser = function (url) {
      var parser = document.createElement('a'),
          structure = {};
      parser.href = url;

      structure = {
        protocol: parser.protocol,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        hash: parser.hash,
        host: parser.host
      };

      return structure;
    };

    return methods;
  }());

  var J = function ($element, opts) {
    var methods = {};

    function init () {
      opts = cleanseOptions($element, opts);

      if (opts.src.match(/streamable/)) {
        handleStreamableMedia(opts);
      }
      else if (opts.src.match(/mp4/)) {
        handleVidFile(opts);
      }
      else if (opts.src.match(/gfycat/)) {
        handleGfyCat(opts);
      }
      else if (opts.src.match(/gifv/)) {
        handleImgur(opts);
      }
      else if (opts.src.match(/gif/)) {
        buildIMGWith(opts);
      }
      else if (opts.src.match(/jpg|jpeg|png/)) {
        buildIMGWith(opts);
      }
      else if (opts.src.match(/youtube/)) {
        handleYouTube(opts);
      }
      else {
        console.log("JOE: Link doesn't have fun media.");
      }
    };

    var cleanseOptions = function ($element, options) {
      options =               options || $element.data('inline') || {},
      options.$element =      $element || $("<div />"),
      options.src =           options.src || $element.data('src') || $element.attr('href'),
      options.autoplay =      options.autoplay || false,
      options.trigger =       options.trigger || TRIGGER_DEFAULT;

      if ($element.text() === "the new old fashioned way - removing src attribute") {
        debugger;
      }
      return options;
    };

    // Various handlers
    var handleStreamableMedia = function (opts) {
      var uriArray = opts.src.split('/'),
          streamableId = uriArray[uriArray.length - 1],
          src = '//streamable.com/res/' + streamableId,
          $element = opts.$element;

      buildiFrame({
        $element: $element,
        width: '100%',
        src: src,
        scrolling: 'no'
      });
    };

    var handleGfyCat = function (opts) {
      var uriArray = opts.src.split('/'),
          gfyCatDealie = uriArray[uriArray.length - 1],
          $element = opts.$element,
          webmSrc, mp4Src;

      $.ajax({
        url: '//gfycat.com/cajax/get/' + gfyCatDealie,
        type: 'GET'
      }).done(function (response) {
        webmSrc = response.gfyItem.webmUrl;
        mp4Src = response.gfyItem.mp4Url;
        buildHTML5Video({
          $element: $element,
          wrapChildSources: true,
          webmSrc: webmSrc,
          mp4Src: mp4Src
        });
      }).fail(function () {
        console.log("Error: Failure to retrieve response for gfycat: ", gfyCatDealie);
      });;
    };

    var handleYouTube = function (opts) {
      var src = opts.src,
          result = Ajax.parser(src),
          ytKey = result.search.split('=')[1],
          $element = opts.$element;

      buildiFrame({
        $element: $element,
        src: '//youtube.com/embed/' + ytKey
      });
    };

    var handleImgur = function (opts) {
      var $element = opts.$element,
          arr = $element.data('src').split('.');
      arr.pop();
      var src = arr.join('.'),
          webmSrc = src + '.webm',
          mp4Src = src + '.mp4';

      buildHTML5Video({
        $element: $element,
        wrapChildSources: true,
        webmSrc: webmSrc,
        mp4Src: mp4Src
      });

    };

    var handleVidFile = function (opts) {
      buildHTML5Video({
        $element: opts.$element
      });
    };

    // f()s that build html elments
    var buildHTML5Video = function (opts) {
      opts = opts || {};
      var height = opts.height || 450,
          width = opts.width || '100%',
          $element = opts.$element || $('<div />'),
          src = opts.src || $element.data('src'),
          //webmSrc = opts.webmSrc || (src + '.webm'),
          //mp4Src = opts.mp4Src || (src + '.mp4'),
          webmSrc = opts.webmSrc || false,
          mp4Src = opts.mp4Src || false,
          wrapChildSources = opts.wrapChildSources || false,
          $video = $('<video>', {
            height: height,
            width: width,
            loop: '',
            //autoplay: '',
            controls: '',
            muted: 'muted'
          }),
          webmID = opts.webmID || 'webmsource',
          mp4ID = opts.mp4ID || 'mp4source',
          $webmSource, $mp4Source;

      if (wrapChildSources) {
        if (webmSrc) {
          $webmSource = $('<source>', {
            id: webmID,
            src: webmSrc,
            type: 'video/webm'
          });
          $video.append($webmSource);
        }
        if (mp4Src) {
          $mp4Source = $('<source>', {
            id: mp4ID,
            src: mp4Src,
            type: 'video/mp4'
          });
          $video.append($mp4Source);
        }
      }
      else {
        $video.attr('src', src);
      }

      handleClick($element, $video);
      return $element;
    };

    var buildIMGWith = function ($element) {
      var $img = $('<img>', {
            src: $element.data('src'),
            width: "100%"
          });

      handleClick($element, $img);
    };

    var buildiFrame = function (opts) {
      opts = opts || {}
      var height = opts.height || 450,
          width = opts.width || 710,
          scrolling = opts.scrolling || 'no',
          $element = opts.$element || $('<div />'),
          src = opts.src || $element.data('src'),
          $iframe = $('<iframe>', {
            src: src,
            frameboarder: 0,
            height: height,
            width: width,
            scrolling: scrolling,
            allowfullscreen: ''
          });

      handleClick($element, $iframe);

      return $element;
    };

    // event handlers
    var handleClick = function ($trigger, $ammo) {
      $trigger.on('click', function (e) {
        e.preventDefault();

        if ($ammo.is(':visible')) {
          $ammo.detach();
        }
        else {
          $ammo.appendTo($trigger);
        }
      });
    };

    init();

    return methods;
  };

  var $document = $(document),
      dealieArray = [];

  $document.ready(function () {
    checkInlineMedia();
    setArcticScroll();
  });

  var checkInlineMedia = function () {
    // $('a[data-inline]').each(function () {
    //   var $this = $(this),
    //       src = $this.data('src'),
    //       dealie = new J({
    //         $element: $this
    //       });

    //   dealieArray.push(dealie);
    // });

    $('a').each(function () {
      var $this = $(this),
          dealie = new J($this, {});

      dealieArray.push(dealie);
    });
  };



  // Arctic Scroll Source
  var setArcticScroll = function () {
    var $postContent = $(".post-content");
    $postContent.fitVids();

    $(".scroll-down").arctic_scroll();

    $(".menu-button, .nav-cover, .nav-close").on("click", function(e){
      e.preventDefault();
      $("body").toggleClass("nav-opened nav-closed");
    });
  };
  // Arctic Scroll by Paul Adam Davis
  // https://github.com/PaulAdamDavis/Arctic-Scroll
  $.fn.arctic_scroll = function (options) {

    var defaults = {
      elem: $(this),
      speed: 500
    },

        allOptions = $.extend(defaults, options);

    allOptions.elem.click(function (event) {
      event.preventDefault();
      var $this = $(this),
          $htmlBody = $('html, body'),
          offset = ($this.attr('data-offset')) ? $this.attr('data-offset') : false,
          position = ($this.attr('data-position')) ? $this.attr('data-position') : false,
          toMove;

      if (offset) {
        toMove = parseInt(offset);
        $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top + toMove) }, allOptions.speed);
      } else if (position) {
        toMove = parseInt(position);
        $htmlBody.stop(true, false).animate({scrollTop: toMove }, allOptions.speed);
      } else {
        $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top) }, allOptions.speed);
      }
    });

  };

})(jQuery);
