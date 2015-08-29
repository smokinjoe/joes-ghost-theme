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
      else if (src.match(/.mv4/)) {
        buildHTML5VideoWith($this);
      }
      else if (src.match(/gif/)) {
        buildIMGwith($this);
      }
    });
  };

  var handleStreamableMedia = function ($element) {
    var uriArray = $element.data('src').split('/'),
        streamableId = uriArray[uriArray.length - 1],
        src = '//streamable/res/' + streamableId;

    buildiFrame({
      el: $element,
      src: src,
      height: 450,
      width: 600,
      scrolling: 'no'
    });
  };

  var buildHTML5VideoWith = function ($element) {
    var $video = $('<video>', {
          src: $element.data('src'),
          height: 450,
          width: 600
        });

    console.log("buildHTML5VideoWith");
  };

  var buildIMGwith = function ($element) {
    var $img = $('<img>', {
          src: $element.dat('src'),
          height: 450,
          width: 600
        });
  };

  var buildiFrame = function (opts) {
    opts = opts || {}
    var src = opts.src,
        height = opts.height || 450,
        width = opts.width || 600,
        scrolling = opts.scrolling || 'no',
        $element = opts.$element || $('<div />'),
        $iframe = $('<iframe>', {
          src: src,
          frameboarder: 0,
          height: height,
          width: width,
          scrolling: scrolling
        });;

    // think about moving this to separate method
    $element.on('click', function (e) {
      debugger;
      e.preventDefault();

      if ($iframe.is(':visible')) {
        $iframe.detach();
      }
      else {
        $iframe.appendTo($element);
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
