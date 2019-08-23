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
/** Map selector
 */

highed.MapSelector = function(chartPreview) {
  var events = highed.events(),
      predefinedMaps = highed.dom.cr('div', ''),
      importContainer = highed.dom.cr('div', ''),
      container = highed.dom.cr('div', 'highed-table-dropzone-container'),
      mapSelectorContainer = highed.dom.cr('div'),
      mapSelectorGeojsonContainer = highed.dom.cr('div', 'highed-map-geojson-container'),
      mapSelectorGeojsonHeader = highed.dom.cr('div', 'highed-map-geojson-header', 'Link Values'),
      geojsonCodeContainer = highed.dom.cr('div', 'highed-map-geojson-options'),
      geojsonCountryContainer = highed.dom.cr('div', 'highed-map-geojson-options'),
      geojsonBtn = highed.dom.btn('Select', 'highed-map-geojson-btn highed-ok-button highed-import-button negative', null);

  function createMapDataSection(toNextPage, cb) {

    if (highed.chartType && highed.chartType === 'Map' && Highcharts) {

      var baseMapPath = "https://code.highcharts.com/mapdata/",
          mapCount = 0,
          mapOptions = highed.dom.cr('div', 'highed-map-selector');
          mapSelectorImages = highed.dom.cr('div', 'highed-map-selector-images-container');

      function getSearchResults(query) {
        mapOptions.innerHTML = '';
        mapSelectorImages.innerHTML = '';
        mapCount = 0;

        Object.keys(Highcharts.mapDataIndex).forEach(function (mapGroup, maps) {
            if (mapGroup !== "version") {
              var found = false;
              var mapSelectorOptions = highed.dom.cr('div', 'highed-map-selector-options');
              Object.keys(Highcharts.mapDataIndex[mapGroup]).forEach(function (desc, path) {
                var pos = desc.search(query);
                if (pos > -1) {
                  //mapOptions += '<option value="' + path + '">' + desc + '</option>';
                  const option = highed.dom.cr('div', 'highed-map-option', desc);
                  var options = [option];

                  highed.dom.ap(mapSelectorOptions, option);

                  if (mapCount < 5) {
                    var mapSelectorImage = highed.dom.cr('img', 'highed-map-selector-image'),
                        mapSelectorImageContainer = highed.dom.cr('div', 'highed-map-selector-image-container'),
                        mapSelectorImageTitle = highed.dom.cr('div', 'highed-map-selector-image-text', desc);

                    mapSelectorImage.src = baseMapPath + (Highcharts.mapDataIndex[mapGroup][desc]).replace('.js', '.svg');
                    highed.dom.ap(mapSelectorImageContainer,mapSelectorImageTitle, mapSelectorImage);
                    highed.dom.ap(mapSelectorImages, mapSelectorImageContainer);
                    options.push(mapSelectorImageContainer);
                  }

                  highed.dom.on(options, 'click', function() {

                    var mapKey = Highcharts.mapDataIndex[mapGroup][desc].slice(0, -3),
                    svgPath = baseMapPath + mapKey + '.svg',
                    geojsonPath = baseMapPath + mapKey + '.geo.json',
                    javascriptPath = baseMapPath + Highcharts.mapDataIndex[mapGroup][desc];
                    
                    chartPreview.options.updateMap(mapKey, javascriptPath, function() {
                      highed.ajax({
                        url: geojsonPath,
                        type: 'GET',
                        dataType: 'json',
                        success: function(data) {
                          events.emit('LoadMapData', data.features);
                          if (toNextPage) toNextPage();
                        },
                        error: function(e) {
                        }
                      })
                    });


                  });

                  mapCount += 1;
                  found = true;
                }
              });

              if (found) highed.dom.ap(mapOptions, highed.dom.cr('div', 'highed-map-option-header', mapGroup), mapSelectorOptions);
            }
        });
      }

      getSearchResults('');
      searchText = 'Search ' + mapCount + ' maps';

      var input = highed.dom.cr('input', 'highed-map-selector-input');
      input.placeholder = 'Search ' + mapCount + ' maps';

      highed.dom.on(input, 'keyup', function(ev) {
        if (ev.target.value === '') { 
          mapOptions.classList.remove("active");
          return;
        }
        //if (!mapOptions.classList.contains('active')) mapOptions.classList += " active";
        getSearchResults(ev.target.value); 
      });

      //mapOptions = '<option value="custom/world.js">' + searchText + '</option>' + mapOptions;
      var inputSelector = highed.dom.cr('div', 'highed-map-selector-arrow', '<i class="fa fa-chevron-down"/>');

      highed.dom.on(inputSelector, 'click', function() {
        if (mapOptions.classList.contains('active')) mapOptions.classList.remove('active');
        else mapOptions.classList += " active";
      });

      var importInput = highed.dom.cr('button', 'highed-ok-button highed-import-button', 'Select File');

      highed.dom.ap(importContainer, 
                    highed.dom.cr('hr'),
                    highed.dom.cr('div', 'highed-toolbox-body-title highed-map-import-geojson-header', 'Import GeoJSON Map'),
                    importInput);

      highed.dom.on(importInput, 'click', function(){
        highed.readLocalFile({
          type: 'text',
          accept: '.json',
          success: function(info) {
            var data = JSON.parse(info.data);
            chartPreview.data.updateMapData(data);
            if (data.features[0].properties.name && data.features[0].properties['hc-key']) {
              events.emit('LoadMapData', data.features);
              if (toNextPage) toNextPage();
            } else {
              // Dont have default keys, find out from user which they are and use them instead.
              var keys = Object.keys(data.features[0].properties);
              highed.dom.on(geojsonBtn, 'click', function(ev) {
                events.emit('LoadMapData', data.features, document.querySelector('input[name="code"]:checked').value, document.querySelector('input[name="country"]:checked').value);
                if (toNextPage) toNextPage();
              });

              [geojsonCodeContainer, geojsonCountryContainer].forEach(function(parent, index){
                keys.forEach(function(key, i) {
                  var radioOption = highed.dom.cr('input');
                  radioOption.type = 'radio';
                  radioOption.value = key;
                  radioOption.name = (index === 0 ? 'code' : 'country');
                  
                  if (i === 0) radioOption.checked = true;

                  highed.dom.ap(parent, 
                                highed.dom.ap(
                                  highed.dom.cr('div', 'highed-map-radio-option'),
                                  radioOption,
                                  highed.dom.cr('span', '', key)
                                ));
                });
              });

              mapSelectorGeojsonContainer.classList += ' active';

            }
          }
        });
      });

      highed.dom.ap(container, 
                    highed.dom.ap(
                      mapSelectorContainer,
                      highed.dom.ap(highed.dom.cr('div', ''), input, inputSelector), 
                      highed.dom.ap(highed.dom.cr('div', ''), mapOptions),
                      mapSelectorImages
                    ),
                    importContainer,
                    predefinedMaps,
                    highed.dom.ap(
                      mapSelectorGeojsonContainer,
                      mapSelectorGeojsonHeader,
                      highed.dom.ap(
                        highed.dom.cr('div', 'highed-map-geojson-option-container'),
                        highed.dom.cr('div', 'highed-map-geojson-option-header', 'Select Code'),
                        geojsonCodeContainer
                      ),
                      highed.dom.ap(
                        highed.dom.cr('div', 'highed-map-geojson-option-container'),
                        highed.dom.cr('div', 'highed-map-geojson-option-header', 'Select Name'),
                        geojsonCountryContainer
                      ),
                      highed.dom.ap(
                        highed.dom.cr('div', 'highed-map-geojson-btn-container'),
                        geojsonBtn
                      )
                    ));
      return container
    }

  }

  function toggleVisible(element, style) {
    highed.dom.style(element, {
      display: style
    });
  }

  function showMaps(type, toNextPage) {
    if (!type || (type && (type.templateTitle !== 'Honeycomb' && type.templateTitle !== 'Tilemap Circle'))) {
      toggleVisible(mapSelectorContainer, 'block');
      toggleVisible(predefinedMaps, 'none');
      toggleVisible(importContainer, 'block');
    } else {
      const samples = highed.samples.getMap('Tilemap');
      
      predefinedMaps.innerHTML = '';

      Object.keys(samples).forEach(function(key) {
        var sample = samples[key];
        
        var container = highed.dom.cr('div', 'highed-chart-template-container highed-map-container'),
            thumbnail = highed.dom.cr('div', 'highed-chart-template-thumbnail'),
            title = highed.dom.cr('div', 'highed-map-text', sample.title);
            
        var mapType = type.templateTitle === 'Honeycomb' ? 'honeycomb' : 'circle';

        highed.dom.style(thumbnail, {
          'background-image': 'url(' + highed.option('thumbnailURL') + sample.thumbnail[mapType] + ')'
        });

        highed.dom.on(container, 'click', function() {
          events.emit('LoadDataSet', sample.dataset.join('\n'));  
          if (toNextPage) toNextPage();
        });
        
        highed.dom.ap(predefinedMaps, highed.dom.ap(container, thumbnail, title));
      });

      toggleVisible(predefinedMaps, 'block');
      toggleVisible(mapSelectorContainer, 'none');
      toggleVisible(importContainer, 'none');
    }
  }


  //////////////////////////////////////////////////////////////////////////////

  return {
    on: events.on,
    createMapDataSection: createMapDataSection,
    showMaps: showMaps
  };
};
