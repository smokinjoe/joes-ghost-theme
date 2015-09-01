/**
 * Main JS file for Casper behaviours
 */

/* globals jQuery, document */
(function ($, undefined) {
    "use strict";

  var $document = $(document);

  $document.ready(function () {
    checkInlineMedia();
    setArcticScroll();
  });

  var checkInlineMedia = function () {
    $('a[data-inline]').each(function () {
      var $this = $(this),
          src = $this.data('src');

      if (src.match(/streamable/)) {
        handleStreamableMedia($this);
      }
      else if (src.match(/mp4/)) {
        handleVidFile($this);
      }
      else if (src.match(/gfycat/)) {
        handleGfyCat($this);
      }
      else if (src.match(/gif/)) {
        buildIMGwith($this);
      }
    });
  };

  var handleStreamableMedia = function ($element) {
    var uriArray = $element.data('src').split('/'),
        streamableId = uriArray[uriArray.length - 1],
        src = '//streamable.com/res/' + streamableId;

    buildiFrame({
      $element: $element,
      src: src,
      height: 450,
      width: 600,
      scrolling: 'no'
    });
  };

  var handleGfyCat = function ($element) {
    var uriArray = $element.data('src').split('/'),
        gfyCatDealie = uriArray[uriArray.length - 1],
        src = '//gfycat.com/' + gfyCatDealie,
        webmSrc = '//zippy.gfycat.com/' + gfyCatDealie + '.webm',
        mp4Src = '//fat.gfycat.com/' + gfyCatDealie + '.mp4';

    buildHTML5Video({
      $element: $element,
      wrapChildSources: true,
      webmSrc: webmSrc,
      mp4Src: mp4Src
    });
  };

  var handleVidFile = function ($element) {
    buildHTML5Video({
      $element: $element
    });
  };

  // JOE: I need to
  //       - do something about the height/width
  //       - something to disable $webmSource and $mp4Source
  var buildHTML5Video = function (opts) {
    opts = opts || {};
    var height = opts.height || 450,
        width = opts.width || '100%',
        $element = opts.$element || $('<div />'),
        src = opts.src || $element.data('src'),
        webmSrc = opts.webmSrc || (src + '.webm'),
        mp4Src = opts.mp4Src || (src + '.mp4'),
        wrapChildSources = opts.wrapChildSources || false,
        $video = $('<video>', {
          height: height,
          width: width,
          loop: '',
          //autoplay: '',
          controls: '',
          muted: 'muted'
        }),
        $webmSource, $mp4Source;

    if (wrapChildSources) {
      $webmSource = $('<source>', {
        id: 'webmsource',
        src: webmSrc,
        type: 'video/webm'
      });
      $mp4Source = $('<source>', {
        id: 'mp4source',
        src: mp4Src,
        type: 'video/mp4'
      });

      $video.append($webmSource);
      $video.append($mp4Source);
    }
    else {
      $video.attr('src', src);
    }

//     <video id="gfyVid1" class="gfyVid" width="1280" height="720" autoplay="" loop="" muted="muted" poster="//thumbs.gfycat.com/CapitalAnimatedFinch-poster.jpg" style="display: block;">

//             <source id="webmsource" src="//zippy.gfycat.com/CapitalAnimatedFinch.webm" type="video/webm">
//             <source id="mp4source" src="//fat.gfycat.com/CapitalAnimatedFinch.mp4" type="video/mp4">
//             Sorry, you don't have HTML5 video and we didn't catch this properly in javascript.
//             You can try to view the gif directly: <a href="http://giant.gfycat.com/CapitalAnimatedFinch.gif">http://giant.gfycat.com/CapitalAnimatedFinch.gif</a>.
//         </video>

    handleClick($element, $video);
    return $element;
  };

  // JOE: deprecate this shit
  var buildHTML5VideoWith = function ($element) {
    var $video = $('<video>', {
          src: $element.data('src'),
          height: 450,
          width: 600,
          controls: true
        });

    handleClick($element, $video);
  };

  var buildIMGwith = function ($element) {
    var $img = $('<img>', {
          src: $element.dat('src'),
          height: 450,
          width: 600
        });

    handleClick($element, $img);
  };

  var buildiFrame = function (opts) {
    opts = opts || {}
    var height = opts.height || 450,
        width = opts.width || '100%',
        scrolling = opts.scrolling || 'no',
        $element = opts.$element || $('<div />'),
        src = opts.src || $element.data('src'),
        $iframe = $('<iframe>', {
          src: src,
          frameboarder: 0,
          height: height,
          width: width,
          scrolling: scrolling
        });

    handleClick($element, $iframe);

    return $element;
  }

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
  }


  // deprecating this - currently not used
  var buildiFrameWith = function ($element) {
    var $iframe = $('<iframe>', {
          src: $element.data('src'),
          frameborder: 0,
          height: 450,
          width: 600,
          scrolling: 'no'
        });

    $iframe.attr('allowfullscreen');

    $element.on('click', function (e) {
      e.preventDefault();

      if ($iframe.is(':visible')) {
        $iframe.detach();
      }
      else {
        $iframe.appendTo($element);
      }
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
