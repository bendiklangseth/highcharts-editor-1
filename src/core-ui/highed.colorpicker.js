/******************************************************************************

Copyright (c) 2016-2018, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

// @format

(function() {
  var container = highed.dom.cr(
      'div',
      'highed-colorpicker highed-colorpicker-responsive'
    ),
    canvas = highed.dom.cr('canvas', 'picker'),
    colorPallet01btn = highed.dom.cr('div', 'highed-ok-button', 'FIN pallett'),
    colorPallet02btn = highed.dom.cr('div', 'highed-ok-button', 'Other colors'),
    closeBtn = highed.dom.cr('div', 'highed-ok-button', 'Close'),
    ctx = canvas.getContext('2d'),
    manualInput = highed.dom.cr('input', 'manual');

  //Attach the container to the document when the document is ready
  highed.ready(function() {
    highed.dom.ap(document.body, container);
  });

  function updatePickerBackground(current) {
    highed.dom.style(manualInput, {
      background: current,
      color: highed.getContrastedColor(current)
    });
  }

  /** Color picker
     *  Component to pick colors from the google material design color palette.
     *  User input is also possible.
     *
     *  The color palette is defined in meta/highed.meta.colors.js,
     *  and is divided into groups of 14 hues per. color.
     *
     *  @example
     *  //Show a color picker at [10,10]
     *  highed.pickColor(10, 10, '#fff', function (color) {
     *      alert('You selected ' + color + ', great choice!');
     *  });
     *
     *  @param x {number} - the x position to display the picker at
     *  @param y {number} - the y position to display the picker at
     *  @param current {string} - the current color
     *  @param fn {function} - the function to call when the color changes
     *    > newColor {string} - the color selected by the user
     */
  highed.pickColor = function(x, y, current, fn, props) {
    if (!props) props = {};
    
    var windowSize = highed.dom.size(document.body),
      containerSize = highed.dom.size(container),
      pickerSize = highed.dom.size(canvas),
      binder = false,
      pbinder = false,
      cbinder = false,
      dbinder = false;

      highed.dom.style(canvas, {
        display: 'none'
      });

      highed.dom.style(manualInput, {
        display: 'none'
      });
      

    if (props.hideCloseBtn) {
      highed.dom.style(closeBtn, {
        display: 'none'
      });
      highed.dom.style(colorPallet01btn, {
        display: 'none'
      });
      highed.dom.style(colorPallet02btn, {
        display: 'none'
      });
    } else {
      highed.dom.style(closeBtn, {
        display: 'block'
      });
      highed.dom.style(colorPallet01btn, {
        display: 'block'
      });
      highed.dom.style(colorPallet02btn, {
        display: 'block'
      });
    }


    ///////////////////////////////////////////////////////////////////////

    /* Draws the color picker itself */
    function drawPicker(colors, typecolor) {
      //There's 14 hues per. color, 19 colors in total.
      var x,
        y,
        col = -1;
        if(typecolor === true) {
          var tx = Math.floor(pickerSize.w / colors.length),
          ty = Math.floor(pickerSize.h);
        } else {
          var tx = Math.floor(pickerSize.w / 14),
          ty = Math.floor(pickerSize.h / 19);
        }

      canvas.width = pickerSize.w;
      canvas.height = pickerSize.h;

      //To avoid picking null
      ctx.fillStyle = '#FFF';
      ctx.fillRect(0, 0, pickerSize.w, pickerSize.h);

      for (y = 0; y < 19; y++) {
        for (x = 0; x < 15; x++) {
          ctx.fillStyle = colors[++col]; //highed.meta.colors[x + y * tx];
          ctx.fillRect(x * tx, y * ty, tx, ty);
        }
      }
    }

    /* Hide the picker */
    function hide() {
      highed.dom.style(container, {
        opacity: 0,
        left: '-20000px',
        'pointer-events': 'none'
      });
      binder();
      pbinder();

      if (cbinder) cbinder();
      if (dbinder) dbinder();
    }

    function rgbToHex(r, g, b) {
      var res = '#' + ((r << 16) | (g << 8) | b).toString(16);
      if (res.length === 5) {
        return res.replace('#', '#00');
      } else if (res.length === 6) {
        return res.replace('#', '#0');
      }
      return res;
    }

    function pickColor(e) {
      var px = e.clientX || e.touches[0].clientX || 0,
        py = e.clientY || e.touches[0].clientY || 0,
        cp = highed.dom.pos(canvas, props.hasOwnProperty('parent')),
        id = ctx.getImageData(px - cp.x - x, py - cp.y - y, 1, 1).data,
        col = rgbToHex(id[0] || 0, id[1], id[2]);

      manualInput.value = col;

      updatePickerBackground(col);

      if (highed.isFn(fn)) {
        fn(col);
      }

      e.cancelBubble = true;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    ///////////////////////////////////////////////////////////////////////

    if (props.parent) {
      highed.dom.ap(props.parent, container);
      highed.dom.style(container, {
        left: 'initial',
        top: 'initial',
        opacity: 1,
        'pointer-events': 'auto'
      });
    } else {
      highed.dom.ap(document.body, container);
      //Make sure we're not off screen
      if (x > windowSize.w - containerSize.w) {
        x = windowSize.w - containerSize.w - 10;
      }

      if (y > windowSize.h - containerSize.h) {
        y = windowSize.h - containerSize.h - 10;
      }
      highed.dom.style(container, {
        left: x + 'px',
        top: y + 'px',
        opacity: 1,
        'pointer-events': 'auto'
      });
    }

    if (!props.parent) {
      dbinder = highed.showDimmer(hide, true, true, 5);
      cbinder = highed.dom.on(closeBtn, 'click', hide);
    }
    
    binder = highed.dom.on(manualInput, 'keyup', function() {
      if (highed.isFn(fn)) {
        fn(manualInput.value);
      }
    });
    pbinder = highed.dom.on(canvas, ['mousedown', 'touchstart'], function(e) {
      var mover = highed.dom.on(canvas, ['mousemove', 'touchmove'], pickColor),
        cancel = highed.dom.on(
          document.body,
          ['mouseup', 'touchend'],
          function() {
            mover();
            cancel();
          }
        );

      pickColor(e);
    });


    manualInput.value = current;
    updatePickerBackground(current);

    colorFIN = false

    function showCanvas() {
      highed.dom.style(canvas, {
        display: 'block'
      });

      highed.dom.style(manualInput, {
        display: 'block'
      });

      highed.dom.style(colorPallet01btn, {
        display: 'none'
      });

      highed.dom.style(colorPallet02btn, {
        display: 'none'
      });
    }

    colorPallet01btn.addEventListener('click', () =>{ 
      colorFIN = true; 
      showCanvas();
      drawPicker(highed.meta.FINcolors, colorFIN);
    });

    colorPallet02btn.addEventListener('click', () =>{ 
      colorFIN = false; 
      showCanvas();
      drawPicker(highed.meta.colors, colorFIN);
    });

    ///////////////////////////////////////////////////////////////////////

    return {
      hide: hide
    };
  };

  highed.dom.ap(container, canvas, manualInput, colorPallet01btn, colorPallet02btn, closeBtn);
})();
