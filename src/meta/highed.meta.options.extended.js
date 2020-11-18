/*

Highcharts Editor v<%= version %>

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

*/

// @format

highed.meta.optionsExtended = {
  options: {
    'option.cat.chart': [
      {
        text: 'option.subcat.title',
        dropdown: true,
        group: 1,
        options: [
          {
            id: 'title--text',
            pid: 'title.text',
            dataType: 'string',
            context: 'General',
            defaults: 'Chart title',
            parent: 'title',
            width: 50
          },
          {
            id: 'title--style',
            dataType: 'font',
            pid: 'title.style',
            context: 'General',
            defaults: '{ "color": "#000000", "fontSize": "18px"}',
            parent: 'title'
          }
        ]
      },
      {
        text: 'option.subcat.subtitle',
        dropdown: true,
        options: [
          {
            id: 'subtitle--text',
            pid:'subtitle.text',
            datatype: 'string',
            context: 'General',
            parent: 'subtitle'
          },
          {
            id: 'subtitle--style',
            dataType: 'font',
            pid: 'subtitle.style',
            context: 'General',
            defaults: '{ "color": "#000000", "fontSize": "10px"}',
            parent: 'subtitle'
          }
        ]
      },
      {
        text: 'option.subcat.caption',
        dropdown: true,
        options: [
          {
            id: 'caption--text',
            pid: 'caption.text',
            dataType: 'text',
            context: 'General',
            defaults: '',
            parent: 'caption',
            width: 100
          },
          {
            id: 'caption--style',
            dataType: 'font',
            pid: 'caption.style',
            context: 'General',
            defaults: '{ "color": "#333333", "fontSize": "12px" }',
            parent: 'caption'
          },

          {
            id: 'caption--margin',
            pid: 'caption.margin',
            dataType: 'number',
            context: 'General',
            defaults: 15,
            parent: 'caption',
            width: 25
          }
        ]
      },
      {
        text: 'option.subcat.appearance',
        dropdown: true,
        options: [
          {
            isHeader: true,
            pid: 'option.subcat.chartarea',
            width: 100,
            id: 'chartarea-header',
            dataType: 'header',
          },
          {
            id: 'colors',
            pid: 'colors',
            dataType: 'array<color>',
            context: 'General',
            mapDisabled: true,
            defaults:
              '[ "#4156a6" , "#f15d61" , "#a6a6a6" , "#5b91cc" , "#97499c" , "#60c3ad" , "#181c62"]'
          },
          {
            id: 'plotOptions--series--dashStyle',
            pid: 'series.dashStyle',
            dataType: 'string',
            context: 'General',
            defaults: 'Solid',
            chartType: 'Map',
            values:
              '["Solid", "ShortDash", "ShortDot", "ShortDashDot", "ShortDashDotDot", "Dot", "Dash" ,"LongDash", "DashDot", "LongDashDot", "LongDashDotDot"]',
            templateType: ['Choropleth', 'Categories'],
            width: 100
          },
          {
            id: 'colorAxis--stops',
            pid: 'colorAxis.stops',
            dataType: 'colorstops',
            context: 'General',
            chartType: 'Map',
            templateType: ['Choropleth', 'Bubble'],
            defaults: [
              [0, '#EFEFFF'],
              [0.67, '#4444FF'],
              [1, '#000022']
            ]
          },
          {
            id: 'plotOptions--mappoint--marker--symbol',
            pid: 'plotOptions.mappoint.marker.symbol',
            dataType: 'string',
            context: 'General',
            chartType: 'Map',
            templateType: ['Point Map'],
            values: '["circle", "square", "diamond", "triangle", "triangle-down"]',
            width: 33
          },
          {
            id: 'plotOptions--mappoint--marker--radius',
            pid: 'plotOptions.mappoint.marker.radius',
            dataType: 'number',
            context: 'General',
            chartType: 'Map',
            templateType: ['Point Map'],
            defaults: 4,
            width: 33
          },
          {
            id: 'plotOptions--series--color',
            pid: 'plotOptions.series.color',
            dataType: 'color',
            context: 'General',
            chartType: 'Map',
            templateType: ['Point Map'],
            defaults: '#0d233a',
            width: 33
          },
          {
            id: 'plotOptions--series--minSize',
            pid: 'plotOptions.series.minSize',
            dataType: 'number',
            context: 'General',
            chartType: 'Map',
            templateType: ['Bubble'],
            defaults: 4,
            width: 50
          },
          {
            id: 'plotOptions--series--maxSize',
            pid: 'plotOptions.series.maxSize',
            dataType: 'number',
            context: 'General',
            chartType: 'Map',
            templateType: ['Bubble'],
            defaults: 60,
            width: 50
          },
          {
            id: 'colorAxis--dataClasses',
            pid: 'colorAxis.dataClasses',
            dataType: 'colorcategories',
            chartType: 'Map',
            templateType: ['Categories', 'Honeycomb', 'Tilemap Circle'],
            context: 'General',
            usesData: true,
            defaults: [{
                from: -100,
                to: 100,
                color: '#C40401'
            }]
          }
        ]
      },
      {
        text: 'option.subcat.tooltip',
        dropdown: true,
        options: [
          {
            id: 'tooltip--enabled',
            pid: 'tooltip.enabled',
            dataType: 'boolean',
            context: 'General',
            defaults: 'true',
            parent: 'tooltip',
            width: 50
          },
          {
            id: 'tooltip--shared',
            pid: 'tooltip.shared',
            dataType: 'boolean',
            context: 'General',
            defaults: 'false',
            parent: 'tooltip',
            mapDisabled: true,
            width: 50
          },
          {
            id: 'tooltip--backgroundColor',
            pid: 'tooltip.backgroundColor',
            dataType: 'color',
            context: 'General',
            defaults: 'rgba(247,247,247,0.85)',
            parent: 'tooltip',
            width: 50
          },
          {
            id: 'tooltip--borderWidth',
            custom: {
              minValue: 0
            },
            pid: 'tooltip.borderWidth',
            dataType: 'number',
            context: 'General',
            defaults: '1',
            parent: 'tooltip',
            width: 50
          },
          {
            id: 'tooltip--borderRadius',
            custom: {
              minValue: 0
            },
            pid: 'tooltip.borderRadius',
            dataType: 'number',
            context: 'General',
            defaults: '3',
            parent: 'tooltip',
            width: 50
          },
          {
            id: 'tooltip--borderColor',
            pid: 'tooltip.borderColor',
            dataType: 'color',
            context: 'General',
            defaults: 'null',
            parent: 'tooltip',
            width: 50
          },
          {
            id: 'tooltip--valueSuffix',
            pid: 'tooltip.valueSuffix',
            dataType: 'string',
            context: 'General',
            defaults: '',
            parent: 'tooltip',
            width: 98
          }
        ]
      },
    ],
    'option.cat.axes': [
      {
        text: 'option.subcat.xaxis',
        dropdown: true,
        mapDisabled: true,
        options: [
        {
          id: 'xAxis-title--style',
          dataType: 'font',
          dataIndex: 0,
          pid: 'xAxis.title.style',
          context: 'General',
          defaults: '{ "color": "#000000" }',
          parent: 'xAxis-title'
        },
        {
          id: 'xAxis-title--text',
          dataIndex: 0,
          pid: 'xAxis.title.text',
          dataType: 'string',
          context: 'General',
          parent: 'xAxis-title',
          width: 50
        },
        {
          id: 'xAxis-labels--format',
          dataIndex: 0,
          pid: 'xAxis.labels.format',
          dataType: 'string',
          context: 'General',
          defaults: '{value}',
          parent: 'xAxis-labels',
          width: 50
        },
        {
          id: 'xAxis--type',
          dataIndex: 0,
          pid: 'xAxis.type',
          dataType: 'string',
          context: 'General',
          defaults: 'linear',
          parent: 'xAxis',
          values: '["linear", "logarithmic", "datetime", "category"]'
        },
        {
          id: 'xAxis--opposite',
          dataIndex: 0,
          pid: 'xAxis.opposite',
          dataType: 'boolean',
          context: 'General',
          defaults: 'false',
          parent: 'xAxis',
          width: 50
        },
        {
          id: 'xAxis--reversed',
          dataIndex: 0,
          pid: 'xAxis.reversed',
          dataType: 'boolean',
          context: 'General',
          defaults: 'false',
          parent: 'xAxis',
          width: 50
        },
        ]
      },
      {
        text: 'option.subcat.yaxis',
        dropdown: true,
        mapDisabled: true,  
        options: [
          {
            id: 'yAxis-title--style',
            dataType: 'font',
            dataIndex: 0,
            pid: 'yAxis.title.style',
            context: 'General',
            defaults: '{ "color": "#000000" }',
            parent: 'yAxis-title'
          },
          {
            id: 'yAxis-title--text',
            dataIndex: 0,
            pid: 'yAxis.title.text',
            dataType: 'string',
            context: 'General',
            defaults: 'Values',
            parent: 'yAxis-title',
            width: 50
          },
          {
            id: 'yAxis--type',
            dataIndex: 0,
            pid: 'yAxis.type',
            dataType: 'string',
            context: 'General',
            defaults: 'linear',
            parent: 'yAxis',
            values: '["linear", "logarithmic", "datetime", "category"]',
            width: 50
          },
          {
            id: 'yAxis-labels--format',
            dataIndex: 0,
            pid: 'yAxis.labels.format',
            dataType: 'string',
            context: 'General',
            defaults: '{value}',
            parent: 'yAxis-labels',
            width: 100
          },
          {
            id: 'yAxis--opposite',
            dataIndex: 0,
            pid: 'yAxis.opposite',
            dataType: 'boolean',
            context: 'General',
            defaults: 'false',
            parent: 'yAxis',
            width: 50
          },
          {
            id: 'yAxis--reversed',
            dataIndex: 0,
            pid: 'yAxis.reversed',
            dataType: 'boolean',
            context: 'General',
            defaults: 'false',
            parent: 'yAxis',
            width: 50
          }
        ]
      }
    ],
    'option.cat.series': [
      {
        id: 'series',
        array: true,
        text: 'option.cat.series',
        mapDisabled: true,
        controlledBy: {
          title: 'Select Series',
          options: 'series',
          optionsTitle: 'name'
        },
        filteredBy: 'series--type',
        options: [
          {
            id: 'series--type',
            pid: 'series.type',
            dataType: 'string',
            context: 'General',
            parent: 'series<treemap>',
            values:
              '[null, "line", "spline", "column", "area", "areaspline", "pie", "arearange", "areasplinerange", "boxplot", "bubble", "columnrange", "errorbar", "funnel", "gauge", "scatter", "waterfall"]',
            subType: [
              'treemap',
              'scatter',
              'line',
              'gauge',
              'heatmap',
              'spline',
              'funnel',
              'areaspline',
              'area',
              'bar',
              'bubble',
              'areasplinerange',
              'boxplot',
              'pie',
              'arearange',
              'column',
              'waterfall',
              'columnrange',
              'pyramid',
              'polygon',
              'solidgauge',
              'errorbar'
            ],
            subTypeDefaults: {},
            width: 50
          },
          {
            id: 'series--dashStyle',
            pid: 'series.dashStyle',
            dataType: 'string',
            context: 'General',
            defaults: 'Solid',
            parent: 'series<areasplinerange>',
            values:
              '["Solid", "ShortDash", "ShortDot", "ShortDashDot", "ShortDashDotDot", "Dot", "Dash" ,"LongDash", "DashDot", "LongDashDot", "LongDashDotDot"]',
            subType: [
              'areasplinerange',
              'polygon',
              'areaspline',
              'spline',
              'scatter',
              'area',
              'bubble',
              'arearange',
              'waterfall',
              'line'
            ],
            subTypeDefaults: {
              polygon: 'Solid',
              areaspline: 'Solid',
              spline: 'Solid',
              scatter: 'Solid',
              area: 'Solid',
              bubble: 'Solid',
              arearange: 'Solid',
              waterfall: 'Dot',
              line: 'Solid'
            },
            width: 50
          },
          {
            id: 'series--color',
            pid: 'series.color',
            dataType: 'color',
            context: 'General',
            defaults: 'null',
            parent: 'series<boxplot>',
            subType: [
              'boxplot',
              'column',
              'waterfall',
              'columnrange',
              'heatmap',
              'area',
              'scatter',
              'bar',
              'treemap',
              'arearange',
              'bubble',
              'errorbar',
              'spline',
              'polygon',
              'line',
              'gauge',
              'areaspline',
              'areasplinerange'
            ],
            subTypeDefaults: {
              heatmap: 'null',
              treemap: 'null',
              errorbar: '#000000'
            },
            width: 18
          },
          {
            id: 'series--negativeColor',
            pid: 'series.negativeColor',
            dataType: 'color',
            context: 'General',
            defaults: 'null',
            parent: 'series<gauge>',
            subType: [
              'gauge',
              'arearange',
              'areasplinerange',
              'line',
              'errorbar',
              'boxplot',
              'areaspline',
              'spline',
              'bar',
              'scatter',
              'polygon',
              'bubble',
              'area',
              'column'
            ],
            subTypeDefaults: {
              arearange: 'null',
              areasplinerange: 'null',
              line: 'null',
              errorbar: 'null',
              boxplot: 'null',
              areaspline: 'null',
              spline: 'null',
              bar: 'null',
              scatter: 'null',
              polygon: 'null',
              bubble: 'null',
              area: 'null',
              column: 'null'
            },
            width: 33
          },
          {
            id: 'series-marker--symbol',
            pid: 'series.marker.symbol',
            dataType: 'string',
            context: 'General',
            parent: 'series<bubble>-marker',
            values:
              '[null, "circle", "square", "diamond", "triangle", "triangle-down"]',
            subType: [
              'bubble',
              'polygon',
              'line',
              'scatter',
              'spline',
              'area',
              'areaspline'
            ],
            subTypeDefaults: {},
            width: 49
          },
          {
            id: 'series--colorByPoint',
            pid: 'series.colorByPoint',
            dataType: 'boolean',
            context: 'General',
            defaults: 'false',
            parent: 'series<treemap>',
            subType: [
              'treemap',
              'heatmap',
              'column',
              'errorbar',
              'columnrange',
              'boxplot',
              'bar',
              'waterfall'
            ],
            subTypeDefaults: {
              heatmap: 'false',
              column: 'false',
              errorbar: 'false',
              columnrange: 'false',
              boxplot: 'false',
              bar: 'false',
              waterfall: 'false'
            },
            width: 50
          },
          {
            id: 'series-marker--enabled',
            pid: 'series.marker.enabled',
            dataType: 'boolean',
            context: 'General',
            defaults: 'null',
            parent: 'series<bubble>-marker',
            subType: [
              'bubble',
              'area',
              'scatter',
              'areaspline',
              'spline',
              'polygon',
              'line'
            ],
            subTypeDefaults: {
              area: 'null',
              scatter: 'null',
              areaspline: 'null',
              spline: 'null',
              polygon: 'null',
              line: 'null'
            },
            width: 50
          },
          {
            id: 'plotOptions-series--stacking',
            pid: 'plotOptions.series.stacking',
            datatype: 'string',
            context: 'General',
            parent: 'series<gauge>',
            values: '[ "undefined", "normal", "overlap", "percent", "stream" ]'
          },
          {
            id: 'series<abands>--yAxis',
            pid: 'series<abands>.yAxis',
            datatype: 'number',
            default: 0,
            context: 'General',
            parent: 'series<gauge>'
          }
        ]
      }
    ],
    'option.cat.legend': [
      {
        text: 'option.subcat.general',
        dropdown: true,
        group: 1,
        options: [
          {
            id: 'legend--enabled',
            pid: 'legend.enabled',
            dataType: 'boolean',
            context: 'General',
            defaults: 'true',
            parent: 'legend'
          },
          {
            id: 'legend--layout',
            pid: 'legend.layout',
            dataType: 'string',
            context: 'General',
            defaults: 'horizontal',
            width: 50,
            parent: 'legend',
            values: '["horizontal", "vertical"]'
          },
          {
            id: 'legend--labelFormat',
            pid: 'legend.labelFormat',
            dataType: 'string',
            context: 'General',
            defaults: '{name}',
            width: 50,
            parent: 'legend',
          }
        ]
      },
      {
        text: 'option.subcat.placement',
        dropdown: true,
        group: 1,
        options: [
          {
            id: 'legend--align',
            pid: 'legend.align',
            dataType: 'string',
            context: 'General',
            defaults: 'center',
            parent: 'legend',
            values: '["left", "center", "right"]',
            width: 50
          },
          {
            id: 'legend--verticalAlign',
            pid: 'legend.verticalAlign',
            dataType: 'string',
            context: 'General',
            defaults: 'bottom',
            parent: 'legend',
            values: '["top", "middle", "bottom"]',
            width: 50
          },
          {
            id: 'legend--floating',
            pid: 'legend.floating',
            dataType: 'boolean',
            context: 'General',
            defaults: 'false',
            parent: 'legend'
          },
          {
            id: 'legend--x',
            pid: 'legend.x',
            dataType: 'number',
            context: 'General',
            parent: 'legend'
          },
          {
            id: 'legend--y',
            pid: 'legend.y',
            dataType: 'number',
            context: 'General',
            parent: 'legend'
          }
        ]
      },
      {
        text: 'option.subcat.legendappearance',
        dropdown: true,
        options: [
          {
            id: 'legend--itemStyle',
            dataType: 'font',
            pid: 'legend.itemStyle',
            context: 'General',
            defaults:
              '{ "color": "#333333", "cursor": "pointer", "fontSize": "12px", "fontWeight": "bold" }',
            parent: 'legend'
          },
          {
            id: 'legend--backgroundColor',
            pid: 'legend.backgroundColor',
            dataType: 'color',
            context: 'General',
            parent: 'legend',
            width: 50
          },
          {
            id: 'legend--borderColor',
            pid: 'legend.borderColor',
            dataType: 'color',
            context: 'General',
            defaults: '#999999',
            parent: 'legend',
            width: 50
          },
          {
            id: 'legend--borderWidth',
            pid: 'legend.borderWidth',
            dataType: 'number',
            context: 'General',
            defaults: '0',
            parent: 'legend',
            width: 50
          },
          {
            id: 'legend--borderRadius',
            pid: 'legend.borderRadius',
            dataType: 'number',
            context: 'General',
            defaults: '0',
            parent: 'legend',
            width: 50
          }
        ]
      }
    ],
    'option.cat.localization': [
      {
        text: 'option.subcat.numberformat',
        dropdown: true,
        group: 1,
        options: [
          {
            id: 'lang--decimalPoint',
            pid: 'lang.decimalPoint',
            dataType: 'string',
            context: 'General',
            defaults: '.',
            parent: 'lang',
            width: 50
          },
          {
            id: 'lang--thousandsSep',
            pid: 'lang.thousandsSep',
            dataType: 'string',
            context: 'General',
            defaults: ' ',
            parent: 'lang',
            width: 50
          }
        ]
      },
      {
        text: 'option.subcat.zoombutton',
        dropdown: true,
        mapDisabled: true,
        group: 1,
        options: [
          {
            id: 'lang--resetZoom',
            pid: 'lang.resetZoom',
            dataType: 'string',
            context: 'General',
            defaults: 'Reset zoom',
            parent: 'lang'
          }
        ]
      }
    ]
  }
};
