/*
 * backgroundSize
 * https://github.com/nsbingham/BackgroundSize
 *
 * Copyright (c) 2012 Nathan Bingham
 * Licensed under the MIT license.
 */

(function($) {

  // Collection method.
  $.fn.backgroundSize = function(options, callback) {

    return this.each(function() {

      var settings = $.extend({}, $.fn.backgroundSize.opts, options);

      var ns = 'bam-backgroundsize';
      var src;

      var $el = $(this);
      var $container;
      var $img;
      var isBody = false;
      var data = $el.data(ns);

      // Calculates ratio for background-size "cover"
      function setDimensions(){

        try {

          // Get image dims
          var imgW,imgH;
          var elRatio;
          var objRatio;
          var size = {};
          var scale;
          var elW, elH;

          imgW = $img.width();
          imgH = $img.height();

          elW = $el.width();
          elH = $el.height();

          elRatio = elH/elW;
          objRatio = imgH/imgW;

          // Calculate size
          if ( elRatio > objRatio ) {
            size.height = elH;
            scale = elH / imgH;
            size.width = imgW * scale;

          } else {
            size.width = elW;
            scale = elW / imgW;
            size.height = imgH * scale;
          }

          if(elW < size.width){
            size.left = (elW - size.width) * 0.5;
          } else {
            size.left = (size.width - elW) * 0.5;
          }

          if(elH < size.height){
            size.top = (elH - size.height) * 0.5;
          } else {
            size.top = (size.height - elH) * 0.5;
          }

          // Calculate offsets
          $img.css(size);

          $el.data(ns, size);

          if(typeof callback === "function") {
            callback($el);
          }

        } catch(err) {
          // IE7 seems to trigger _adjustBG before the image is loaded.
          // This try/catch block is a hack to let it fail gracefully.
        }

      }

      function _appendBackground(){

        $container = $('<div />')
              .addClass(ns)
              .css({
                  display:(settings.fade ? 'none' : 'block'),
                  left: 0,
                  top: 0,
                  position: (isBody ? 'fixed' : 'absolute'),
                  overflow: 'hidden',
                  zIndex: (isBody ? -1 : 0),
                  margin: 0,
                  padding: 0,
                  height: '100%',
                  width: '100%'
              });

        $img = $('<img />')
          .css({
            position: 'absolute',
            margin: 0,
            padding: 0,
            border: 'none',
            zIndex: 0})
          .bind('load', function(){setDimensions(function(){

            // Remove background
            $el.css({
              backgroundImage: 'none'
            });

          });})
          .appendTo($container);
                   
        $img.attr('src', src); // Hack for IE img onload event

        // Attach the settings
        $el.data(ns, settings).append($container);

        // Adjust the background size when the window is resized
        // or orientation has changed (iOS)
        $(window).on('resize onorientationchange', setDimensions);

      }

      function _width() {
          return isBody ? $el.width() : $el.innerWidth();
      }
      
      function _height() {
          return isBody ? $el.height() : $el.innerHeight();
      }

      // Check if we're grabbing the background from CSS
      if(settings.useBackground && settings.src === null){
        src = $el.getBGPath();
      } else {
        src = settings.src;
      }

      // Exit if we don't have an image to use
      if(src === null) {return;}

      // Is this an element?
      if($el[0].nodeType === 1){
        // Is this the body element
        if($el[0].tagName.toLowerCase() === 'body'){ isBody = true; }
      }

      // If this is the first time it's being called, create the container
      if(data === undefined || data === 'undefined') {
        _appendBackground();

        // Remove an images marked for deletion
        $el.find('.' + settings.deleteClass).remove();
      }

    });

  };

  // Returns the background-image attribute of an element if it exists
  $.fn.getBGPath = function(){

    var elem = this[0], url = $(elem).css('background-image');

    if(url) {

      // Filter out the path from the url parameter
      return url.replace('url', '').replace('(', '').replace(')', '').replace('\"', '').replace('\"', '');

    } else {

      return null;

    }
  };

  $.fn.backgroundSize.opts = {
    useBackground: true,
    src: null,
    parameter: 'cover',
    deleteClass: 'remove',
    fade: false
  };

}(jQuery));
