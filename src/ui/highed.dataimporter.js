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

(function () {
	var webImports = {};

	highed.plugins.import = {
		/** Install a data import plugin
		 * @namespace highed.plugins.import
		 * @param name {string} - the name of the plugin
		 * @param defintion {object} - the plugin definition
		 *   > description {string} - the plugin description
		 *   > treatAs {string} - what to treat the import as: `json|csv`
		 *   > fetchAs {string} - what the expect request return is
		 *   > defaultURL {string} - the default URL
		 *   > depdendencies {array<string>} - set of additional javascript/css to include
		 *   > options {object} - additional user-supplied options
		 *      > label {string} - the title of the option
		 *      > type {string} - the type of the option
		 *      > default {string} - the default value
		 *   > filter {function} - function to call when executing the plugin
		 *      >  url {anything} - request url
		 *      >  options {object} - contains user-defined options
		 *      >  callback {function} - function to call when the import is done
		 */
		install: function (name, defintion) {
			if (highed.isNull(webImports[name])) {
				webImports[name] = highed.merge(
					{
						title: false,
						description: '',
						treatAs: 'csv',
						fetchAs: 'json',
						defaultURL: '',
						dependencies: [],
						options: {},
						filter: function () { }
					},
					defintion
				);

				if (webImports[name].dependencies) {
					webImports[name].dependencies.forEach(function (d) {
						highed.include(d);
					});
				}
			} else {
				highed.log(
					1,
					'tried to register an import plugin which already exists:',
					name
				);
			}
		}
	};

	/** Data importer widget
	 *
	 *  @example
	 *  var dimp = highed.DataImporter(document.body);
	 *  dimp.on('ImportCSV', function (data) {
	 *      console.log('Importing csv:', data.csv);
	 *  });
	 *
	 *  @constructor
	 *
	 *  @emits ImportChartSettings - when importing chart settings
	 *  @emits ImportCSV - when importing CSV
	 *  @emits ImportJSON - when importing JSON
	 *  @param parent {domnode} - the node to attach the widget to
	 *  @param attributes {object} - the settings
	 *     > options {string} - the options to include: `csv json plugins samples`
	 *     > plugins {string} - the plugins to activate (must have been installed first)
	 */
	highed.DataImporter = function (parent, attributes) {
		var events = highed.events(),
			properties = highed.merge(
				{
					options: ['csv', 'plugins', 'samples', 'export'],
					plugins: ['CSV', 'JSON', 'Apiary', 'FAME', 'Difi', 'Socrata', 'Google Spreadsheets']
				},
				attributes
			),
			tabs = highed.TabControl(parent, false, true),
			csvTab = tabs.createTab({ title: 'Import' }),
			exportTab = tabs.createTab({ title: 'Export' }),
			jsonTab = tabs.createTab({ title: 'JSON' }),
			webTab = tabs.createTab({ title: 'Plugins' }),
			samplesTab = tabs.createTab({ title: 'Sample Data' }),
			csvPasteArea = highed.dom.cr('textarea', 'highed-imp-pastearea'),
			csvImportBtn = highed.dom.cr(
				'button',
				'highed-imp-button highed-imp-pasted-button',
				'Import Pasted Data'
			),
			liveDataImportBtn = highed.dom.cr('button', 'highed-imp-button', 'Live Data'),
			csvImportFileBtn = highed.dom.cr(
				'button',
				'highed-imp-button',
				'Import File'
			),
			delimiter = highed.dom.cr('input', 'highed-imp-input'),
			dateFormat = highed.dom.cr('input', 'highed-imp-input'),
			decimalPoint = highed.dom.cr('input', 'highed-imp-input'),
			firstAsNames = highed.dom.cr('input', 'highed-imp-input'),
			jsonPasteArea = highed.dom.cr('textarea', 'highed-imp-pastearea'),
			jsonImportBtn = highed.dom.cr('button', 'highed-imp-button', 'Import'),
			jsonImportFileBtn = highed.dom.cr(
				'button',
				'highed-imp-button',
				'Upload & Import File'
			),
			spreadsheetImportBtn = highed.dom.cr(
				'button',
				'highed-imp-button',
				'Google Spreadsheet'
			),
			commaDelimitedBtn = highed.dom.cr(
				'button',
				'highed-imp-button highed-export-btn',
				'Export comma delimited'
			),
			semicolonDelimitedBtn = highed.dom.cr(
				'button',
				'highed-imp-button highed-export-btn',
				'Export semi-colon delimited'
			),
			webSplitter = highed.HSplitter(webTab.body, { leftWidth: 30 }),
			webList = highed.List(webSplitter.left);

		jsonPasteArea.value = JSON.stringify({}, undefined, 2);

		setDefaultTabSize(600, 600, [csvTab, exportTab, jsonTab, webTab, samplesTab]);
		///////////////////////////////////////////////////////////////////////////

		highed.dom.style(samplesTab.body, { overflow: 'hidden' });

		properties.options = highed.arrToObj(properties.options);
		properties.plugins = highed.arrToObj(properties.plugins);

		//Remove referenced un-installed plugins.
		Object.keys(properties.plugins).forEach(function (plugin) {
			if (highed.isNull(webImports[plugin])) {
				delete properties.plugins[plugin];
			}
		});

		function setDefaultTabSize(w, h, tabs) {
			tabs.forEach(function (tab) {
				tab.on('Focus', function () {
					highed.dom.style(parent, { width: 600 + 'px', height: 600 + 'px' });
					tab.resize(600 - 10, 600 - 10);
				});
			});
		}

		function updateOptions() {
			if (!properties.options.csv) {
				csvTab.hide();
			}

			if (!properties.options.export) {
				exportTab.hide();
			}

			//Always disable json options..

			if (!properties.options.json) {
				jsonTab.hide();
			}

			if (
				Object.keys(properties.plugins).length === 0 ||
				!properties.options.plugins
			) {
				webTab.hide();
			}

			if (!properties.options.samples) {
				samplesTab.hide();
			}

			tabs.selectFirst();
		}

		function searchCategories(e) {
			var input, filter, ul, li, i, txtValue;
			input = document.getElementsByClassName('category_search')[0];
			filter = input.value.toUpperCase();
			ul = document.getElementsByClassName('category-ul ')[0];
			li = ul.getElementsByTagName('li');

			for (i = 0; i < li.length; i++) {
				console.log(li[i]);
			}

			e.stopPropagation();
		}

		function fameApiGET(url_value, cb) {
			highed.ajax({
				url: url_value,
				cors: true,
				type: 'GET',
				dataType: 'jsonp',
				contentType: 'application/json',
				success: function (val) {
					cb(JSON.parse(val));
				},
				error: function (xhr, ajaxOptions, throwError) {
					alert("There was a problem retriving data from " + url_value);
				}
			});
		}

		function buildWebTab() {
			Object.keys(webImports).forEach(function (name) {
				if (!properties.plugins[name]) {
					return;
				}

				function buildBody() {
					var options = webImports[name],
						url = highed.dom.cr('input', 'highed-imp-input-stretch'),
						urlTitle = highed.dom.cr('div', '', 'URL'),
						importBtn = highed.dom.cr(
							'button',
							'highed-imp-button',
							'Import ' + name + ' from URL'
						),
						dynamicOptionsContainer = highed.dom.cr(
							'table',
							'highed-customizer-table'
						),
						dynamicOptions = {};

					url.value = options.defaultURL || '';

					Object.keys(options.options || {}).forEach(function (name) {
						dynamicOptions[name] = options.options[name].default;

						highed.dom.ap(
							dynamicOptionsContainer,
							highed.InspectorField(
								options.options[name].type,
								options.options[name].default,
								{
									title: options.options[name].label
								},
								function (nval) {
									dynamicOptions[name] = nval;
								},
								true
							)
						);
					});

					if (options.surpressURL) {
						highed.dom.style([url, urlTitle], {
							display: 'none'
						});
					}

					url.placeholder = 'Enter URL';

					if (name === "FAME") { // TODO: RYDDE OPP
						highed.dom.style(parent, {
							width: '1200px',
							height: '800px'
						});

						var fameTitle = highed.dom.cr('div', 'highed-plugin-fame-title highed-customizer-table-heading', name + ' - Search for time series'),
							serieImport = highed.dom.cr('button', 'highed-imp-button', 'Import time series'),
							navigation_ul = highed.dom.cr('ol', 'highed-plugin-fame-nav-ol')
						selectCat = highed.dom.cr('li', 'highed-plugin-fame-nav-li', 'Select category'),
							category_ul = highed.dom.cr('ul', 'category-ul'),
							selectTimeS = highed.dom.cr('li', 'highed-plugin-fame-nav-li', 'Select time series'),
							editTimeS = highed.dom.cr('li', 'highed-plugin-fame-nav-li', 'Edit time series'),
							timeSeries_ul = highed.dom.cr('ul', 'timeSeries-ul'),
							timeSeries_counter_li = highed.dom.cr('li', 'timeSeries-li'),
							timeSeries_filter_li = highed.dom.cr('li', 'filter-li'),
							selectTimeSeries_ul = highed.dom.cr('ul', 'selectTimeSeries-ul'),
							editTimeSeries_ul = highed.dom.cr('ul', 'edit-timeSeries-ul'),
							timeSerieTitle = highed.dom.cr('li', 'timeserie-title-li'),
							timeSerieExpression = highed.dom.ap(highed.dom.cr('li', 'timeserie-info-li'), highed.dom.cr('p', 'timeserie-info-li-p', 'Expression'), highed.dom.cr('input', 'timeserie-info-li-input')),
							timeSerieFrequency = highed.dom.ap(highed.dom.cr('li', 'timeserie-info-li'), highed.dom.cr('p', 'timeserie-info-li-p', 'Frequency'), highed.dom.cr('input', 'timeserie-info-li-input')),
							timeSerieRange = highed.dom.ap(highed.dom.cr('li', 'timeserie-info-li'), highed.dom.cr('p', 'timeserie-info-li-p', 'Range'), highed.dom.cr('p', 'timeserie-range-from-p', 'From '), highed.dom.cr('input', 'timeserie-range-from-input'), highed.dom.cr('p', 'timeserie-range-to-p', 'To '), highed.dom.cr('input', 'timeserie-range-to-input')),
							timeSerieOther = highed.dom.ap(highed.dom.cr('li', 'timeserie-info-li'), highed.dom.cr('p', 'timeserie-info-li-p', 'Other'), highed.dom.cr('input', 'timeserie-info-li-input')),
							filterTitle = highed.dom.cr('p', 'timeS-filterTitle', 'Filter search:'),
							filterType = ['Region: All', 'Frequency: All', 'Datasource: All', 'Measure: All', 'Seasonal: All'],
							headerText_desc = highed.dom.cr('p', 'header-text  desc', 'Description'),
							headerText_name = highed.dom.cr('p', 'header-text  h-name', 'Name'),
							headerText_first_value = highed.dom.cr('p', 'header-text  first-value', 'First value'),
							headerText_last_value = highed.dom.cr('p', 'header-text  last-value', 'Last value'),
							selectTimeSeries_ul_header = highed.dom.cr('li', 'selectTimeSeries-ul-header'),
							subcat_0_elements = document.getElementsByClassName('sub_0_li-element'),
							category_ul_elm = document.getElementsByClassName('category-ul'),
							fame_json = {},
							getCategoriesJson = {},
							categoryCommand = "",
							timeserie_name = "",
							timeserie_channel = "",
							timeserie_frequency = "",
							timeserie_rangefrom = "",
							timeserie_rangeto = "",
							timeserie_lastUpdate = "",
							timeserie_other = "CONVERT ON";

						selectCat.appendChild(category_ul);

						selectCat.setAttribute('data-before', '⮟');
						selectTimeS.setAttribute('data-before', '⮟');
						editTimeS.setAttribute('data-before', '⮟');

						fameApiGET(webImports[name].defaultURL, function (categories) {
							categories.data.FameCategories.forEach(function (cat) {
								var sub_0_cat = highed.dom.cr('li', 'sub_0_li-element');
								sub_0_cat.innerHTML = cat.CategoryName;
								category_ul.appendChild(sub_0_cat);

								if (cat.SubCategories.length !== 0) {
									var sub_1_cat = highed.dom.cr('ul', 'sub_1_menu_ul');

									cat.SubCategories.forEach(function (sub1_elm) {
										var sub1_li = highed.dom.cr('li', 'sub_1_li_element');
										sub1_li.innerHTML = sub1_elm.CategoryName;
										sub1_li.setAttribute('data-command', sub1_elm.CategorySearchCommand)
										sub_1_cat.appendChild(sub1_li);

										if (sub1_elm.SubCategories.length !== 0) {
											var sub_2_menu = highed.dom.cr('ul', 'sub_1_menu_ul');

											sub1_elm.SubCategories.forEach(function (sub2_elm) {
												var sub2_li = highed.dom.cr('li', 'sub_2_li_element');
												sub2_li.innerHTML = sub2_elm.CategoryName;
												sub2_li.setAttribute('data-command', sub2_elm.CategorySearchCommand);
												sub_2_menu.appendChild(sub2_li);
											})
											sub1_li.appendChild(sub_2_menu);
										}
									})
									sub_0_cat.appendChild(sub_1_cat);
								}
							})
						});

						timeSeries_filter_li.appendChild(filterTitle)

						filterType.forEach(function (filter) {
							var p_filter = highed.dom.cr('p', 'timeS-filterType', filter);
							timeSeries_filter_li.appendChild(p_filter);
						})

						highed.dom.ap(selectTimeSeries_ul_header, headerText_desc, headerText_name, headerText_first_value, headerText_last_value);

						highed.dom.on(selectCat, 'click', function () {
							if (!category_ul_elm[0].classList.contains("show")) {
								category_ul_elm[0].classList.toggle("show");
								selectCat.setAttribute('data-before', '⮝');
							}
							else {
								category_ul_elm[0].classList.toggle("show");
								selectCat.setAttribute('data-before', '⮟');
							}


							Array.prototype.forEach.call(subcat_0_elements, function (subcat_0_elm) {
								subcat_0_elm.setAttribute('data-before', '⮞');
								var subcat_1_elements = subcat_0_elm.children[0].children;

								subcat_0_elm.addEventListener('click', function (event_0) {
									if (!subcat_0_elm.getElementsByTagName('ul')[0].classList.contains("show")) {
										subcat_0_elm.getElementsByTagName('ul')[0].classList.toggle("show");
										subcat_0_elm.setAttribute('data-before', '⮟');
									}
									else {
										subcat_0_elm.getElementsByTagName('ul')[0].classList.toggle("show");
										subcat_0_elm.setAttribute('data-before', '⮞');
									}

									Array.prototype.forEach.call(subcat_1_elements, function (subcat_1_elm) {

										var subcat_2_elements;
										if (subcat_1_elm.getElementsByTagName('ul').length > 0) {
											subcat_1_elm.setAttribute('data-before', '⮞');
										}

										subcat_1_elm.addEventListener('click', function (event_1) {

											if (subcat_1_elm.getElementsByTagName('ul').length > 0) {
												if (!subcat_1_elm.getElementsByTagName('ul')[0].classList.contains("show")) {
													subcat_1_elm.getElementsByTagName('ul')[0].classList.toggle("show");
													subcat_1_elm.setAttribute('data-before', '⮟');
												}
												else {
													subcat_1_elm.getElementsByTagName('ul')[0].classList.toggle("show");
													subcat_1_elm.setAttribute('data-before', '⮞');
												}

												subcat_2_elements = subcat_1_elm.children[0].children;


												Array.prototype.forEach.call(subcat_2_elements, function (subcat_2_elm) {
													subcat_2_elm.classList.toggle("show");
													subcat_2_elm.addEventListener('click', function (event_2) {
														categoryCommand = subcat_2_elm.getAttribute('data-command');

														selectCat.setAttribute('data-before', '⮟');
														selectTimeS.setAttribute('data-before', '⮝');

														category_ul_elm[0].classList.toggle("show");

														fameApiGET(webImports[name].timeSURL + categoryCommand, function (categoryTimeseries) {

															timeSeries_counter_li.innerHTML = categoryTimeseries.data.length + ' time series';

															categoryTimeseries.data.forEach(function (timeserie) {
																var timeserie_li = highed.dom.cr('li', 'timeserie-element');
																var variant_serie_ul = highed.dom.cr('ul', 'variant-serie-ul');

																timeserie_li.setAttribute('data-before', '⮞');

																var timeserie_li_p = [
																	highed.dom.cr('p', 'timeserie-li-text  desc', timeserie.Description),
																	highed.dom.cr('p', 'timeserie-li-text  name', timeserie.Name),
																	highed.dom.cr('p', 'timeserie-li-text  first-value', timeserie.Firstvalue),
																	highed.dom.cr('p', 'timeserie-li-text  last-value', timeserie.Lastvalue),
																	highed.dom.cr('i', 'timeserie-li-text  ts-info-icon', '🛈')
																]

																var time_info = highed.dom.cr('div', 'timeserie-information-div');
																highed.dom.ap(time_info, highed.dom.cr('p', 'timeserie-information-title', timeserie.Description),
																	highed.dom.ap(highed.dom.cr('ul', 'timeserie-information-ul'),
																		highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Name:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Name)),
																		highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Datasource:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.DataSource)),
																		highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Region:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Region)),
																		highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Frequency:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Frequency)),
																		highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'First value:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Firstvalue)),
																		highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Last value:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Lastvalue)),
																		highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Updated:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.LastUpdated)),
																		highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Measure:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Measure)),
																		highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Vintage:'), highed.dom.cr('p', 'timeserie-information-li-p', (timeserie.HasVintage) ? "TRUE" : "FALSE")),
																		highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Vintage value:'), highed.dom.cr('p', 'timeserie-information-li-p', (timeserie.VintValue === "") ? "NaN" : timeserie.VintValue))
																	));
																highed.dom.ap(timeserie_li, time_info)

																highed.dom.on(timeserie_li_p[4], 'mouseover', function (event_icon) {
																	time_info.classList.toggle("show");
																	event_icon.stopPropagation();
																})
																highed.dom.on(timeserie_li_p[4], 'mouseout', function (event_icon) {
																	time_info.classList.toggle("show");
																	event_icon.stopPropagation();
																})
																timeserie_li_p.forEach(function (p_tag) {
																	timeserie_li.appendChild(p_tag);
																})


																highed.dom.on(timeserie_li, 'click', function (event_3) {
																	if (!variant_serie_ul.classList.contains("show")) {
																		variant_serie_ul.classList.toggle("show");
																		timeserie_li.setAttribute('data-before', '⮟');
																	}
																	else {
																		variant_serie_ul.classList.toggle("show");
																		timeserie_li.setAttribute('data-before', '⮞');
																	}

																	console.log(timeserie)
																	if (!timeserie_li.classList.contains('select')) {
																		timeserie_li.classList.toggle("select");
																		timeserie_name = timeserie.Name;
																		timeSerieTitle.innerHTML = timeserie.Description + " " + timeserie.DataSource + "."

																		timeSerieExpression.getElementsByTagName('input')[0].value = timeserie.Name;
																		timeSerieFrequency.getElementsByTagName('input')[0].value = timeserie.Frequency;
																		timeSerieRange.getElementsByTagName('input')[0].value = timeserie.Firstvalue;
																		timeSerieRange.getElementsByTagName('input')[1].value = timeserie.Lastvalue;
																		timeserie_channel = timeserie.Database;
																		timeserie_frequency = timeserie.Frequency;
																		timeserie_rangefrom = timeserie.Firstvalue;
																		timeserie_rangeto = timeserie.Lastvalue;
																		var lastUpdated = timeserie.LastUpdated.slice(0, -9);
																		lastUpdated = lastUpdated.replace(/-/g, ".");
																		var temp = lastUpdated.split('.');
																		var newFormat = temp[2] + "." + temp[1] + "." + temp[0];
																		timeserie_lastUpdate = newFormat;
																	}

																	fameApiGET(webImports[name].timeSVintgs + timeserie.Name, function (timeserie_vintages) {
																		timeserie_vintages.data.forEach(function (vintage) {
																			var vintage_li = highed.dom.cr('li', 'vintage-element');
																			var vintage_li_p = [
																				highed.dom.cr('p', 'timeserie-li-text  desc', vintage.VintValue),
																				highed.dom.cr('p', 'timeserie-li-text  name', vintage.Name),
																				highed.dom.cr('p', 'timeserie-li-text  first-value', vintage.Firstvalue),
																				highed.dom.cr('p', 'timeserie-li-text  last-value', vintage.Lastvalue),
																				highed.dom.cr('i', 'timeserie-li-text  ts-info-icon', '🛈')
																			]

																			var time_info = highed.dom.cr('div', 'timeserie-information-div');
																			highed.dom.ap(time_info, highed.dom.cr('p', 'timeserie-information-title', vintage.Description),
																				highed.dom.ap(highed.dom.cr('ul', 'timeserie-information-ul'),
																					highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Name:'), highed.dom.cr('p', 'timeserie-information-li-p', vintage.Name)),
																					highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Datasource:'), highed.dom.cr('p', 'timeserie-information-li-p', vintage.DataSource)),
																					highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Region:'), highed.dom.cr('p', 'timeserie-information-li-p', vintage.Region)),
																					highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Frequency:'), highed.dom.cr('p', 'timeserie-information-li-p', vintage.Frequency)),
																					highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'First value:'), highed.dom.cr('p', 'timeserie-information-li-p', vintage.Firstvalue)),
																					highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Last value:'), highed.dom.cr('p', 'timeserie-information-li-p', vintage.Lastvalue)),
																					highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Updated:'), highed.dom.cr('p', 'timeserie-information-li-p', vintage.LastUpdated)),
																					highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Measure:'), highed.dom.cr('p', 'timeserie-information-li-p', vintage.Measure)),
																					highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Vintage:'), highed.dom.cr('p', 'timeserie-information-li-p', (vintage.HasVintage) ? "TRUE" : "FALSE")),
																					highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Vintage value:'), highed.dom.cr('p', 'timeserie-information-li-p', (vintage.VintValue === "") ? "NaN" : vintage.VintValue))
																				));
																			highed.dom.ap(vintage_li, time_info)

																			highed.dom.on(vintage_li_p[4], 'mouseover', function (event_icon) {
																				time_info.classList.toggle("show");
																				event_icon.stopPropagation();
																			})
																			highed.dom.on(vintage_li_p[4], 'mouseout', function (event_icon) {
																				time_info.classList.toggle("show");
																				event_icon.stopPropagation();
																			})

																			vintage_li_p.forEach(function (vin_p) {
																				vintage_li.appendChild(vin_p);
																			})

																			variant_serie_ul.appendChild(vintage_li);

																			highed.dom.on(vintage_li, 'click', function (event_4) {
																				if (timeserie_li.classList.contains('select')) {
																					timeserie_li.classList.toggle("select");
																				}

																				console.log(variant_serie_ul)
																				Array.prototype.forEach.call(variant_serie_ul.getElementsByTagName('li'), function (variant_li) {

																					if (variant_li === vintage_li) {
																						vintage_li.classList.toggle("select");
																						timeserie_name = vintage.Name;
																						timeSerieTitle.innerHTML = vintage.Description + " " + vintage.DataSource + "."

																						timeSerieExpression.getElementsByTagName('input')[0].value = vintage.Name;
																						timeSerieFrequency.getElementsByTagName('input')[0].value = vintage.Frequency;
																						timeSerieRange.getElementsByTagName('input')[0].value = vintage.Firstvalue;
																						timeSerieRange.getElementsByTagName('input')[1].value = vintage.Lastvalue;
																						timeserie_name = vintage.Name;
																						timeserie_channel = vintage.Database;
																						timeserie_frequency = vintage.Frequency;
																						timeserie_rangefrom = vintage.Firstvalue;
																						timeserie_rangeto = vintage.Lastvalue;
																						var lastUpdated = vintage.LastUpdated.slice(0, -9);
																						lastUpdated = lastUpdated.replace(/-/g, ".");
																						var temp = lastUpdated.split('.');
																						var newFormat = temp[2] + "." + temp[1] + "." + temp[0];
																						timeserie_lastUpdate = newFormat;

																					}
																					else {
																						if (variant_li.classList.contains('select')) {
																							variant_li.classList.toggle("select");
																						}
																					}

																				});
																				event_4.stopPropagation();
																			});
																		});
																	});

																	event_3.stopPropagation();
																})

																selectTimeSeries_ul.appendChild(timeserie_li);
																selectTimeSeries_ul.appendChild(variant_serie_ul);
															})
														})

														event_2.stopPropagation();
													})
												})
											}
											else {
												categoryCommand = subcat_1_elm.getAttribute('data-command');

												fameApiGET(webImports[name].timeSURL + categoryCommand, function (categoryTimeseries) {

													timeSeries_counter_li.innerHTML = categoryTimeseries.data.length + ' time series';

													categoryTimeseries.data.forEach(function (timeserie) {
														var timeserie_li = highed.dom.cr('li', 'timeserie-element');
														var variant_serie_ul = highed.dom.cr('ul', 'variant-serie-ul');

														var timeserie_li_p = [
															highed.dom.cr('p', 'timeserie-li-text  desc', timeserie.Description),
															highed.dom.cr('p', 'timeserie-li-text  name', timeserie.Name),
															highed.dom.cr('p', 'timeserie-li-text  first-value', timeserie.Firstvalue),
															highed.dom.cr('p', 'timeserie-li-text  last-value', timeserie.Lastvalue),
															highed.dom.cr('i', 'timeserie-li-text  ts-info-icon', '🛈')
														]

														var time_info = highed.dom.cr('div', 'timeserie-information-div');
														highed.dom.ap(time_info, highed.dom.cr('p', 'timeserie-information-title', timeserie.Description),
															highed.dom.ap(highed.dom.cr('ul', 'timeserie-information-ul'),
																highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Name:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Name)),
																highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Datasource:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.DataSource)),
																highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Region:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Region)),
																highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Frequency:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Frequency)),
																highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'First value:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Firstvalue)),
																highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Last value:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Lastvalue)),
																highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Updated:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.LastUpdated)),
																highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Measure:'), highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Measure)),
																highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Vintage:'), highed.dom.cr('p', 'timeserie-information-li-p', (timeserie.HasVintage) ? "TRUE" : "FALSE")),
																highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Vintage value:'), highed.dom.cr('p', 'timeserie-information-li-p', (timeserie.VintValue === "") ? "NaN" : timeserie.VintValue))
															));
														highed.dom.ap(timeserie_li, time_info)

														highed.dom.on(timeserie_li_p[4], 'mouseover', function (event_icon) {
															time_info.classList.toggle("show");
															event_icon.stopPropagation();
														})
														highed.dom.on(timeserie_li_p[4], 'mouseout', function (event_icon) {
															time_info.classList.toggle("show");
															event_icon.stopPropagation();
														})

														timeserie_li_p.forEach(function (p_tag) {
															timeserie_li.appendChild(p_tag);
														})


														highed.dom.on(timeserie_li, 'click', function (event_3) {

															variant_serie_ul.classList.toggle("show");

															if (!timeserie_li.classList.contains('select')) {
																console.log(timeserie)
																timeserie_li.classList.toggle("select");
																timeserie_name = timeserie.Name;
																timeSerieTitle.innerHTML = timeserie.Description + " " + timeserie.DataSource + "."

																timeSerieExpression.getElementsByTagName('input')[0].value = timeserie.Name;
																timeSerieFrequency.getElementsByTagName('input')[0].value = timeserie.Frequency;
																timeSerieRange.getElementsByTagName('input')[0].value = timeserie.Firstvalue;
																timeSerieRange.getElementsByTagName('input')[1].value = timeserie.Lastvalue;
																timeserie_channel = timeserie.Database;
																timeserie_frequency = timeserie.Frequency;
																timeserie_rangefrom = timeserie.Firstvalue;
																timeserie_rangeto = timeserie.Lastvalue;
																var lastUpdated = timeserie.LastUpdated.slice(0, -9);
																lastUpdated = lastUpdated.replace(/-/g, ".");
																var temp = lastUpdated.split('.');
																var newFormat = temp[2] + "." + temp[1] + "." + temp[0];
																timeserie_lastUpdate = newFormat;
															}

															fameApiGET(webImports[name].timeSVintgs + timeserie.Name, function (timeserie_vintages) {
																timeserie_vintages.data.forEach(function (vintage) {
																	console.log(vintage)
																	var vintage_li = highed.dom.cr('li', 'vintage-element');
																	var vintage_li_p = [
																		highed.dom.cr('p', 'timeserie-li-text  desc', vintage.VintValue),
																		highed.dom.cr('p', 'timeserie-li-text  name', vintage.Name),
																		highed.dom.cr('p', 'timeserie-li-text  first-value', vintage.Firstvalue),
																		highed.dom.cr('p', 'timeserie-li-text  last-value', vintage.Lastvalue)
																	]

																	vintage_li_p.forEach(function (vin_p) {
																		vintage_li.appendChild(vin_p);
																	})

																	variant_serie_ul.appendChild(vintage_li);

																	highed.dom.on(vintage_li, 'click', function (event_4) {
																		if (timeserie_li.classList.contains('select')) {
																			timeserie_li.classList.toggle("select");
																		}

																		console.log(variant_serie_ul)
																		Array.prototype.forEach.call(variant_serie_ul.getElementsByTagName('li'), function (variant_li) {

																			if (variant_li === vintage_li) {
																				vintage_li.classList.toggle("select");
																				timeSerieTitle.innerHTML = vintage.Description + " " + vintage.DataSource + "."

																				timeSerieExpression.getElementsByTagName('input')[0].value = vintage.Name;
																				timeSerieFrequency.getElementsByTagName('input')[0].value = vintage.Frequency;
																				timeSerieRange.getElementsByTagName('input')[0].value = vintage.Firstvalue;
																				timeSerieRange.getElementsByTagName('input')[1].value = vintage.Lastvalue;
																				timeserie_name = vintage.Name;
																				timeserie_channel = vintage.Database;
																				timeserie_frequency = vintage.Frequency;
																				timeserie_rangefrom = vintage.Firstvalue;
																				timeserie_rangeto = vintage.Lastvalue;
																				var lastUpdated = vintage.LastUpdated.slice(0, -9);
																				lastUpdated = lastUpdated.replace(/-/g, ".");
																				var temp = lastUpdated.split('.');
																				var newFormat = temp[2] + "." + temp[1] + "." + temp[0];
																				timeserie_lastUpdate = newFormat;
																			}
																			else {
																				if (variant_li.classList.contains('select')) {
																					variant_li.classList.toggle("select");
																				}
																			}
																		})
																		event_4.stopPropagation();
																	})
																})
															});

															event_3.stopPropagation();
														})

														selectTimeSeries_ul.appendChild(timeserie_li);
														selectTimeSeries_ul.appendChild(variant_serie_ul);
													})
												})
											}

											timeSeries_ul.classList.toggle("show");

											event_1.stopPropagation();

										})
									})
									event_0.stopPropagation();
								})

							})
						})

						highed.dom.on(selectTimeS, 'click', function () {
							if (categoryCommand === "") {
								alert("You must choose a category before selecting a time series!");
							}
							else {
								if (!timeSeries_ul.classList.contains("show")) {
									timeSeries_ul.classList.toggle("show");
									selectTimeS.setAttribute('data-before', '⮝');
								}
								else {
									timeSeries_ul.classList.toggle("show");
									selectTimeS.setAttribute('data-before', '⮟');
								}
							}
						})

						highed.dom.on(editTimeS, 'click', function () {
							if (timeserie_name === "") {
								alert("You must choose a timeseries before being able to edit it!")
							}
							else {
								if (timeSeries_ul.classList.contains("show")) {
									timeSeries_ul.classList.toggle("show");
								}
								if (!editTimeSeries_ul.classList.contains("show")) {
									editTimeSeries_ul.classList.toggle("show");
									editTimeS.setAttribute('data-before', '⮝');
								}
								else {
									editTimeSeries_ul.classList.toggle("show");
									editTimeS.setAttribute('data-before', '⮟');
								}

								Array.prototype.forEach.call(editTimeS.getElementsByTagName('ul')[0].getElementsByTagName('li'), function (item) {
									highed.dom.on(item, 'click', function (event) {
										event.stopPropagation();
									})
								})
							}
						})

						highed.dom.ap(editTimeSeries_ul, timeSerieTitle, timeSerieExpression, timeSerieFrequency, timeSerieRange, timeSerieOther)
						highed.dom.ap(editTimeS, editTimeSeries_ul);
						highed.dom.ap(timeSeries_ul, timeSeries_counter_li, timeSeries_filter_li, selectTimeSeries_ul_header, selectTimeSeries_ul);
						highed.dom.ap(selectTimeS, timeSeries_ul);
						highed.dom.ap(navigation_ul, selectCat, selectTimeS, editTimeS);

						highed.dom.on(serieImport, 'click', function () {
							highed.snackBar('Importing ' + name + ' data');
							timeserie_name = timeSerieExpression.getElementsByTagName('input')[0].value;
							timeserie_frequency = timeSerieFrequency.getElementsByTagName('input')[0].value;
							timeserie_rangefrom = timeSerieRange.getElementsByTagName('input')[0].value;
							timeserie_rangeto = timeSerieRange.getElementsByTagName('input')[1].value;

							highed.ajax({
								url: "http://epiwithfame.norwayeast.cloudapp.azure.com/api/fameintegration/getobservations?channelname=" + timeserie_channel + "&expression=" + timeserie_name + "&frequency=" + timeserie_frequency + "&rangefrom=" + timeserie_rangefrom + "&rangeto=" + timeserie_rangeto + "&timeSerieLastUpdated=" + timeserie_lastUpdate + "&other=" + "",
								cors: true,
								type: 'GET',
								dataType: 'jsonp',
								contentType: 'application/json',
								success: function (val) {
									options.filter(val, highed.merge({}, dynamicOptions), function (
										error,
										val
									) {

										if (error) return highed.snackBar('import error: ' + error);

										if (options.treatAs === 'csv') {
											csvTab.focus();
											csvPasteArea.value = val;
											emitCSVImport(val);
										}
										else if (options.treatAs === 'csv-append') {
											csvTab.focus();

											if (csvPasteArea.value != '') {
												var existingDataArray = csvPasteArea.value.split('\n');
												var appdendingDataArray = val.split('\n');
												var newDataArray = [];
												var matchColA = [];
												var matchColAIndex = -1;

												existingDataArray.forEach(element => {
													var lineArr = [];
													var arr1 = element.split(',')

													for (let i = 0; i < arr1.length; i++) {
														if (i === 0) {
															var colA = arr1[i];
															matchColAIndex = appdendingDataArray.findIndex(element => element.includes(colA));
															//matchColAIndex = appdendingDataArray.indexOf(colA);
														}
														lineArr.push(arr1[i])
													}
													if (matchColAIndex >= 0) {
														var uu = appdendingDataArray[matchColAIndex];
														var newVals = uu.split(',');
														if (newVals != null) {
															for (let j = 1; j < newVals.length; j++) {
																lineArr.push(newVals[j]);
															}
														}
														//lineArr.push('\n');
														newDataArray.push(lineArr.join(','));

													}

												});
												csvPasteArea.value = newDataArray.join('\n');
											}
											else {
												csvPasteArea.value = val;
											}
											//csvPasteArea.value = val;
											emitCSVImport(csvPasteArea.value);
										}
										else {
											processJSONImport(val);
										}
									});
								},
								error: function (xhr, ajaxOptions, throwError) {
									alert("There was a problem retriving data from " + url_value);
								}
							});

						})
					}
					else {
						highed.dom.style(parent, {
							width: '600px',
							height: '600px'
						});
					}

					highed.dom.on(importBtn, 'click', function () {
						highed.snackBar('Importing ' + name + ' data');

						if (highed.isFn(options.request)) {
							return options.request(url.value, dynamicOptions, function (
								err,
								chartProperties
							) {
								if (err) return highed.snackBar('import error: ' + err);
								events.emit(
									'ImportChartSettings',
									chartProperties,
									options.newFormat
								);
							});
						}
						highed.ajax({
							url: "https://cors-anywhere.herokuapp.com/" + url.value, //Temp CORS fix
							type: 'get',
							dataType: options.treatAs || 'text',
							success: function (val) {
								options.filter(val, highed.merge({}, dynamicOptions), function (
									error,
									val
								) {

									if (error) return highed.snackBar('import error: ' + error);
									if (options.treatAs === 'csv') {
										csvTab.focus();
										csvPasteArea.value = val;
										emitCSVImport(val);
									}
									else if (options.treatAs === 'csv-append') {
										csvTab.focus();

										if (csvPasteArea.value != '') {
											var existingDataArray = csvPasteArea.value.split('\n');
											var appdendingDataArray = val.split('\n');
											var newDataArray = [];
											var matchColA = [];
											var matchColAIndex = -1;

											existingDataArray.forEach(element => {
												var lineArr = [];
												var arr1 = element.split(',')

												for (let i = 0; i < arr1.length; i++) {
													if (i === 0) {
														var colA = arr1[i];
														matchColAIndex = appdendingDataArray.findIndex(element => element.includes(colA));
														//matchColAIndex = appdendingDataArray.indexOf(colA);
													}
													lineArr.push(arr1[i])
												}
												if (matchColAIndex >= 0) {
													var uu = appdendingDataArray[matchColAIndex];
													var newVals = uu.split(',');
													if (newVals != null) {
														for (let j = 1; j < newVals.length; j++) {
															lineArr.push(newVals[j]);
														}
													}
													//lineArr.push('\n');
													newDataArray.push(lineArr.join(','));

												}

											});
											csvPasteArea.value = newDataArray.join('\n');
										}
										else {
											csvPasteArea.value = val;
										}
										//csvPasteArea.value = val;
										emitCSVImport(csvPasteArea.value);
									}
									else {
										processJSONImport(val);
									}
								});
							},
							error: function (err) {
								highed.snackBar('import error: ' + err);
							}
						});
					});

					webSplitter.right.innerHTML = '';

					if (name === "FAME") {

						highed.dom.ap(
							webSplitter.right,
							highed.dom.ap(
								highed.dom.cr('div', 'highed-plugin-details'),
								fameTitle,
								navigation_ul,
								highed.dom.cr('br'),
								serieImport
							)
						)
					}
					else {
						highed.dom.ap(
							webSplitter.right,
							highed.dom.ap(
								highed.dom.cr('div', 'highed-plugin-details'),
								highed.dom.cr(
									'div',
									'highed-customizer-table-heading',
									options.title || name
								),
								highed.dom.cr('div', 'highed-imp-help', options.description),
								urlTitle,
								url,
								Object.keys(options.options || {}).length
									? dynamicOptionsContainer
									: false,
								highed.dom.cr('br'),
								importBtn
							)
						);
					}
				}

				webList.addItem({
					id: name,
					title: webImports[name].title || name,
					click: buildBody
				});
			});

			webList.selectFirst();
		}

		function buildSampleTab() {
			samplesTab.innerHTML = '';

			highed.samples.each(function (sample) {
				var data = sample.dataset.join('\n'),
					loadBtn = highed.dom.cr(
						'button',
						'highed-box-size highed-imp-button',
						sample.title
					);

				highed.dom.style(loadBtn, { width: '99%' });

				highed.dom.on(loadBtn, 'click', function () {
					emitCSVImport(data);
					csvPasteArea.value = data;
					csvTab.focus();
				});

				highed.dom.ap(
					samplesTab.body,
					//highed.dom.cr('div', '', name),
					//highed.dom.cr('br'),
					loadBtn,
					highed.dom.cr('br')
				);
			});
		}

		function emitCSVImport(csv, cb) {

			var data = {
				itemDelimiter: delimiter.value,
				firstRowAsNames: firstAsNames.checked,
				dateFormat: dateFormat.value,
				csv: csv || csvPasteArea.value,
				decimalPoint: decimalPoint.value
			}
			events.emit('ImportCSV', data, cb);
		}


		function loadCSVExternal(csv) {
			csvPasteArea.value = csv;
			emitCSVImport();
		}

		function processJSONImport(jsonString) {
			var json = jsonString;
			if (highed.isStr(json)) {
				try {
					json = JSON.parse(jsonString);
				} catch (e) {
					highed.snackBar('Error parsing json: ' + e);
					return false;
				}
			}
			console.log(json)
			events.emit('ImportJSON', json);
		}

		/** Force a resize of the widget
		 *  @memberof highed.DataImporter
		 *  @param w {number} - the new width
		 *  @param h {number} - the new height
		 */
		function resize(w, h) {
			var bsize,
				ps = highed.dom.size(parent);

			tabs.resize(w || ps.w, h || ps.h);
			bsize = tabs.barSize();
			webSplitter.resize(w || ps.w, (h || ps.h) - bsize.h - 20);
			webList.resize(w || ps.w, (h || ps.h) - bsize.h);

			exporter.resize(null, 300);
		}

		/** Show the importer
		 *  @memberof highed.DataImporter
		 */
		function show() {
			tabs.show();
		}

		/** Hide the importer
		 *  @memberof highed.DataImporter
		 */
		function hide() {
			tabs.hide();
		}

		function addImportTab(tabOptions) {
			var newTab = tabs.createTab({ title: tabOptions.name || 'Features' });

			if (highed.isFn(tabOptions.create)) {
				tabOptions.create(newTab.body);
			}
			if (tabOptions.resize) {
				newTab.on('Focus', function () {
					highed.dom.style(parent, { width: tabOptions.resize.width + 'px', height: tabOptions.resize.height + 'px' });
					newTab.resize(tabOptions.resize.width - 10, tabOptions.resize.height - 10);
				});
			}
		}

		function selectTab(index) {
			tabs.select(index);
		}
		///////////////////////////////////////////////////////////////////////////

		highed.dom.ap(
			exportTab.body,
			commaDelimitedBtn,
			semicolonDelimitedBtn,
			highed.dom.cr('hr', 'highed-imp-hr')
		);


		var exporter = highed.Exporter(exportTab.body);
		exporter.resize(null, 300);

		highed.dom.ap(
			csvTab.body,
			spreadsheetImportBtn,
			liveDataImportBtn,
			csvImportFileBtn,
			highed.dom.cr('hr', 'highed-imp-hr'),
			highed.dom.cr(
				'div',
				'highed-imp-help',
				'Paste CSV into the below box, or upload a file. Click Import to import your data.'
			),
			csvPasteArea,
			csvImportBtn
		);

		highed.dom.ap(
			jsonTab.body,
			highed.dom.cr(
				'div',
				'highed-imp-help',
				'Paste JSON into the below box, or upload a file. Click Import to import your data. <br/><b>The JSON is the data passed to the chart constructor, and may contain any of the valid <a href="http://api.highcharts.com/highcharts/" target="_blank">options</a>.</b>'
			),
			jsonPasteArea,
			jsonImportFileBtn,
			jsonImportBtn
		);

		highed.dom.on(commaDelimitedBtn, 'click', function () {
			events.emit('ExportComma');
		});

		highed.dom.on(semicolonDelimitedBtn, 'click', function () {
			events.emit('ExportSemiColon');
		});

		highed.dom.on(spreadsheetImportBtn, 'click', function () {
			events.emit('ImportGoogleSpreadsheet');
		});

		highed.dom.on(csvImportBtn, 'click', function () {
			emitCSVImport();
		});

		highed.dom.on(liveDataImportBtn, 'click', function () {
			events.emit('ImportLiveData', {
				//  url: liveDataInput.value
			});
		});

		highed.dom.on(csvPasteArea, 'keyup', function (e) {
			if (/*e.keyCode === 13 || */((e.metaKey || e.ctrlKey) && e.key === 'z')) {
				emitCSVImport(csvPasteArea.value);
			}
		});

		highed.dom.on(csvImportFileBtn, 'click', function () {
			highed.readLocalFile({
				type: 'text',
				accept: '.csv',
				success: function (info) {
					csvPasteArea.value = info.data;
					emitCSVImport();
				}
			});
		});

		highed.dom.on(jsonImportBtn, 'click', function () {
			processJSONImport(jsonPasteArea.value);
		});

		highed.dom.on(jsonImportFileBtn, 'click', function () {
			highed.readLocalFile({
				type: 'text',
				accept: '.json',
				success: function (info) {
					jsonPasteArea.value = info.data;
					processJSONImport(info.data);
				}
			});
		});

		buildSampleTab();
		buildWebTab();
		updateOptions();

		delimiter.value = ',';
		dateFormat.value = 'dd-mm-YYYY';
		firstAsNames.type = 'checkbox';
		decimalPoint.value = '.';
		firstAsNames.checked = true;

		//Should hide the web tab if running where cross-origin is an issue

		resize();

		///////////////////////////////////////////////////////////////////////////

		function clearImportPasteArea() {
			csvPasteArea.value = null
		}

		return {
			on: events.on,
			loadCSV: loadCSVExternal,
			clearImportPasteArea: clearImportPasteArea,
			resize: resize,
			show: show,
			hide: hide,
			addImportTab: addImportTab,
			exporter: exporter,
			selectTab: selectTab,
			emitCSVImport: emitCSVImport
		};
	};
})();
