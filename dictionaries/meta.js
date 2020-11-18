/******************************************************************************

Copyright (c) 2016, Highsoft

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

module.exports = {
	options: {
		'option.cat.title': [{
			text: 'option.subcat.titles',			
			options: [{
				text: 'Chart title',
				id: 'title--text',
				tooltipText: 'The main chart title.'
			}, {
				text: 'Chart subtitle',
				id: 'subtitle--text',
				tooltipText: 'The chart\'s subtitle, normally displayed with smaller fonts below the main title.'
			}, {
				text: 'Y axis title',
				id: 'yAxis-title--text',
				tooltipText: 'The Y axis title, normally displayed vertically along the Y axis.',
				dataIndex: 0
			}]
		}],

		'option.cat.appearance': [{
			text: 'option.subcat.fonts',			
			options: [
				{
					id: 'chart--style',
					text: 'Font family',
					dataType: 'font',
					tooltipText: 'The font to use throughout the chart'
				}
			]
		}, {
			text: 'option.subcat.titlestyle',			
			options: [
				{
					id: 'title--style',
					text: 'Main title style',
					dataType: 'font',
					tooltipText: 'Styling for the main chart title'
				},
				//{id: 'title--text'},
				{
					id: 'subtitle--style',
					text: 'Subtitle style',
					dataType: 'font',
					tooltipText: 'Styling for the chart\'s subtitle, normally displayed with smaller fonts below the main title'
				}

			]
		}, {
			text: 'option.subcat.seriescolors',
			
			options: [{
				id: 'colors',
				text: 'Colors',
				tooltipText: 'Default colors for the data series, or for individual points in a pie series or a column series ' +
				'with individual colors. Colors will be picked in succession. If a color is explicitly set for each series ' +
				'in the <em>Data series</em> view, that color will take precedence.'
			}]
		}, {
			text: 'option.subcat.chartarea',
			
			options: [
				{
					id: 'chart--backgroundColor',
					text: 'Background color',
					tooltipText: 'Background color for the full chart area'
				},
				{id: 'chart--borderWidth', text: 'Border width', custom: {minValue: 0}},
				{id: 'chart--borderRadius', text: 'Border corner radius', custom: {minValue: 0}},
				{id: 'chart--borderColor', text: 'Border color'}
			]
		}, {
			text: 'option.subcat.plotarea',
			
			options: [
				{
					id: 'chart--plotBackgroundColor', text: 'Background color',
					tooltipText: 'Background color for the plot area, the area inside the axes'
				},
				{
					id: 'chart--plotBackgroundImage', text: 'Background image URL',
					tooltipText: 'The online URL for an image to use as the plot area background'
				},
				{id: 'chart--plotBorderWidth', text: 'Border width'},
				{id: 'chart--plotBorderColor', text: 'Border color'}
			]
		}
		],

		'option.cat.axes': [
		 {
			text: 'option.subcat.xaxis',
			
			options: [
				{
					id: 'xAxis-title--style',
					dataType: 'font',
					text: 'X axis title',
					tooltipText: 'Styling and text for the X axis title',
					dataIndex: 0
				},
				{
					id: 'xAxis-title--text',
					text: 'Text',
					dataIndex: 0
				},
				{
					id: 'xAxis--type', 
					text: 'Type', 
					tooltipText: 'The type of axis',
					dataIndex: 0
				},
				{
					id: 'xAxis--opposite', 
					text: 'Opposite side of chart',
					dataIndex: 0
				},
				{
					id: 'xAxis--reversed', 
					text: 'Reversed direction',
					dataIndex: 0
				},
				{
					id: 'xAxis-labels--format', 
					text: 'Axis labels format',
					tooltipText: '<p>A format string for the axis labels. The value is available through a variable <code>{value}</code>.</p>' +
					'<p><b>Units</b> can be added for example like <code>{value} USD</code>.</p>' +
					'<p><b>Formatting</b> can be added after a colon inside the variable, for example <code>USD {value:.2f}</code> to display two decimals, ' +
					'or <code>{value:%Y-%m-%d}</code> for a certain time format.',
					dataIndex: 0
				},
				{
					id: 'xAxis--linkedTo',
					text: 'Linked To',
					tooltipText: 'Index of another axis that this axis is linked to. When an axis is linked to a master axis, it will take the same extremes '
								+ 'as the master, but as assigned by min or max or by setExtremes. It can be used to show additional info, or to eas reading the chart by '
								+ 'duplicating the scales.'
				}
			]
		}, {
			text: 'option.subcat.yaxis',
			
			options: [
				{
					id: 'yAxis-title--style',
					dataType: 'font',
					text: 'Y axis title style',
					tooltipText: 'Styling and text for the X axis title',
					dataIndex: 0
				},
				{
					id: 'yAxis--type', 
					text: 'Type', 
					tooltipText: 'The type of axis',
					dataIndex: 0
				},
				{
					id: 'yAxis--opposite', 
					text: 'Opposite side of chart',
					dataIndex: 0
				},
				{
					id: 'yAxis--reversed', 
					text: 'Reversed direction',
					dataIndex: 0
				},
				{
					id: 'yAxis-labels--format', 
					text: 'Axis labels format',
					tooltipText: '<p>A format string for the axis labels. The value is available through a variable <code>{value}</code>.</p>' +
					'<p><b>Units</b> can be added for example like <code>{value} USD</code>.</p>' +
					'<p><b>Formatting</b> can be added after a colon inside the variable, for example <code>USD {value:.2f}</code> to display two decimals, ' +
					'or <code>{value:%Y-%m-%d}</code> for a certain time format.',
					dataIndex: 0
				},
				{
					id: 'yAxis--linkedTo',
					text: 'Linked To',
					tooltipText: 'Index of another axis that this axis is linked to. When an axis is linked to a master axis, it will take the same extremes '
								+ 'as the master, but as assigned by min or max or by setExtremes. It can be used to show additional info, or to eas reading the chart by '
								+ 'duplicating the scales.'
				}
			]
		}
		],
		'option.cat.series': [{
			id: 'series',
			array: true,
			text: 'option.cat.series',
			controlledBy: {
				title: 'Select Series',
				options: 'series',
				optionsTitle: 'name'
			},
			filteredBy: 'series--type',
			options: [
				{id: 'series--type', text: 'Series type', tooltipText: 'The type of series'},
				{
					id: 'series--color',
					text: 'Color',
					tooltipText: 'The main color of the series. If no color is given here, the color ' +
					'is pulled from the array of default colors as given in the "Appearance" section.'
				},
				{
					id: 'series--negativeColor',
					text: 'Negative color',
					tooltipText: 'The negative color of the series below the threshold. Threshold is default zero, this can be changed in the advanced settings.'
				},
				{
					id: 'series--colorByPoint',
					text: 'Color by point',
					tooltipText: 'Use one color per point. Colors can be changed in the "Appearance" section.'
				},
				{id: 'series--dashStyle', text: 'Dash style'},
				{id: 'series-marker--enabled', text: 'Enable point markers'},
				{id: 'series-marker--symbol', text: 'Marker symbol'},
				{
					id: 'series-tooltip--valuePrefix',
					text: 'Prefix in tooltip',
					tooltipText: 'Text to prepend before the value in the tooltip'
				},
				{
					id: 'series-tooltip--valueSuffix',
					text: 'Suffix (unit) in tooltip',
					tooltipText: 'Text to append after the value in the tooltip'
				},
				{
					id: 'plotOptions-series--stacking',
					text: 'Stacked',
					tooltipText: 'Whether to stack the values of each series on top of each other. Possible values are undefined to disable, "normal" to stack by value or "percent". '
					+ 'When stacking is enabled, data must be sorted in ascending X order.Some stacking options are related to specific series types. '
					+ 'In the streamgraph series type, the stacking option is set to "stream". The second one is "overlap", which only applies to waterfall series.'
				},
				{
					id: 'series<abands>--yAxis',
					text: 'Y Axis',
					tooltipText: 'When using dual or multiple y axes, this number defines which yAxis the particular series is connected to. It refers to either the {@link #yAxis.id|axis id} or the index of the axis in the yAxis array, with 0 being the first.'
				}
			]
		}],

		'option.cat.labels': [{
			id: 'data-labels',
			text: 'option.subcat.labels',
			
			options: [{
				id: 'plotOptions-series-dataLabels--enabled',
				text: 'Enable data labels for all series',
				tooltipText: 'Show small labels next to each data value (point, column, pie slice etc)'
			}, {
				id: 'plotOptions-series-dataLabels--format',
				text: 'Data label format',
				tooltipText: '<p>A format string for the value labels. The value is available through a variable <code>{y}</code>. Other available variables ' +
				'are <code>{x}</code> and <code>{key}</code> for the category.</p>' +
				'<p><b>Units</b> can be added for example like <code>{y} USD</code>.</p>' +
				'<p><b>Formatting</b> can be added after a colon inside the variable, for example <code>USD {y:.2f}</code> to display two decimals, ' +
				'or <code>{x:%Y-%m-%d}</code> for a certain time format.'
			}, {
				id: 'plotOptions-series-dataLabels--style',
				text: 'Text style'
			}]
		}],

		'option.cat.legend': [
			{
				text: 'option.subcat.general',
				
				options: [
					{id: 'legend--enabled', text: 'Enable legend'},
					{id: 'legend--layout', text: 'Item layout'}
				]
			}, {
				text: 'option.subcat.placement',
				
				options: [
					{id: 'legend--align', text: 'Horizontal alignment'},
					{id: 'legend--verticalAlign', text: 'Vertical alignment'},
					{
						id: 'legend--y',
						text: 'Vertical offset',
						tooltipText: 'The pixel offset of the legend relative to its alignment'
					},
					{id: 'legend--floating', text: 'Float on top of plot area'},
					{
						id: 'legend--x',
						text: 'Horizontal offset',
						tooltipText: 'The pixel offset of the legend relative to its alignment'
					}
				]
			}, {
				text: 'option.subcat.legendappearance',
				
				options: [
					{id: 'legend--itemStyle', text: 'Text style', dataType: 'font'},
					{id: 'legend--itemHiddenStyle', text: 'Text style hidden', dataType: 'font'},
					{id: 'legend--backgroundColor', text: 'Background color'},
					{id: 'legend--borderWidth', text: 'Border width'},
					{id: 'legend--borderRadius', text: 'Border corner radius'},
					{id: 'legend--borderColor', text: 'Border color'}
				]
			}
		],

		'option.cat.tooltip': [{
			text: 'option.subcat.general',
			
			options: [
				{
					id: 'tooltip--enabled',
					text: 'Enable tooltip',
					tooltipText: 'Enable or disable the tooltip. The tooltip is the information box ' +
					'that appears on mouse-over or touch on a point.'
				},
				{id: 'tooltip--shared', text: 'Shared between series', tooltipText: 'When the tooltip is shared, the entire plot area will capture mouse movement or touch events. Tooltip texts for series types with ordered data (not pie, scatter, flags etc) will be shown in a single bubble. This is recommended for single series charts and for tablet/mobile optimized charts.'}
			]
		}, {
			text: 'option.subcat.colorborder',			
			options: [
				{
					id: 'tooltip--backgroundColor',
					text: 'Background color',
					tooltipText: 'The background color of the tooltip'
				},
				{id: 'tooltip--borderWidth', text: 'Border width', custom: {minValue: 0}},
				{id: 'tooltip--borderRadius', text: 'Border corner radius', custom: {minValue: 0}},
				{
					id: 'tooltip--borderColor',
					text: 'Border color',
					tooltipText: 'The border color of the tooltip. If no color is given, ' +
					'the corresponding series color is used.'
				}
			]
		}
		],

		'option.cat.exporting': [{
			text: 'option.cat.exporting',		
			options: [{
				id: 'exporting--enabled',
				text: 'Enable exporting',
				tooltipText: 'Enable the context button on the top right of the chart, allowing end users ' +
				'to download image exports.'
			}, {
				id: 'exporting--sourceWidth',
				text: 'Exported width',
				tooltipText: 'Note that this overrides the scale property',
				custom: {
					minValue: 10,
					maxValue: 2000,
					step: 10
				},
				tooltipText: 'The width of the original chart when exported. The pixel width of the exported image is then ' +
				'multiplied by the <em>Scaling factor</em>.'
			}, {
				id: 'exporting--sourceHeight',
				text: 'Exported height',
				custom: {
					minValue: 10,
					maxValue: 2000,
					step: 10
				},
				tooltipText: 'Analogous to the <em>Exported width</em>'
			}, {
				id: 'exporting--scale',
				text: 'Scaling factor',
				tooltipText: 'The export scale. Note that this is overridden if width is set.',
				custom: {
					minValue: 1,
					maxValue: 4
				}
			}]
		}
		],

		'option.cat.localization': [{
			text: 'option.subcat.numberformat',			
			options: [
				{
					id: 'lang--decimalPoint',
					text: 'Decimal point',
					tooltipText: 'The decimal point used for all numbers'
				},
				{
					id: 'lang--thousandsSep',
					text: 'Thousands separator',
					tooltipText: 'The thousands separator used for all numbers'
				}
			]
		}, {
			text: 'option.subcat.exportbutton',			
			options: [
				{id: 'lang--contextButtonTitle', text: 'Context button title'},
				{id: 'lang--printChart', text: 'Print chart'},
				{id: 'lang--downloadPNG', text: 'Download PNG'},
				{id: 'lang--downloadJPEG', text: 'Download JPEG'},
				{id: 'lang--downloadPDF', text: 'Download PDF'},
				{id: 'lang--downloadSVG', text: 'Download SVG'},
				{id: 'lang--downloadXLS', text: 'Download XLS'},
				{id: 'lang--downloadCSV', text: 'Download CSV'}				
			]
		}, {
			text: 'option.subcat.zoombutton',			
			options: [
				{id: 'lang--resetZoom', text: 'Reset zoom button'},
				{id: 'lang--resetZoomTitle', text: 'Reset zoom button title'}
			]
		}
		]
	}
};
