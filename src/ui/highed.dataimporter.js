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
				if(tab.title === "Plugins") {
					tab.on('Focus', function () {
						highed.dom.style(parent, { width: 1200 + 'px', height: 800 + 'px' });
						tab.resize(1200 - 10, 800 - 10);
					});
				}
				else {
					tab.on('Focus', function () {
						highed.dom.style(parent, { width: 600 + 'px', height: 600 + 'px' });
						tab.resize(600 - 10, 600 - 10);
					});
				}
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

		function fameApiGET(url_value, cb) {
			return new Promise(function (resolve, reject) {
				highed.ajax({
					url: url_value,
					cors: true,
					type: 'GET',
					dataType: 'jsonp',
					contentType: 'application/json',
					success: function (val) {
						cb(JSON.parse(val));
						resolve(val);
					},
					error: function(xhr, ajaxOptions, throwError) {
						alert("There was a problem retriving data from " + url_value);
						reject(throwError);
					}
				});
			})
		}

		function buildWebTab() {
			Object.keys(webImports).forEach(function (name) {
				if (!properties.plugins[name]) {
					return;
				}
				
				async function buildBody() {
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
					

					if(name === "FAME"){ // TODO: RYDDE OPP

						var import_timeserie_btn = highed.dom.cr('button', 'highed-imp-button','Import time series'),
						fame_category_ul = highed.dom.cr('ul', 'fame-category-ul'),
						select_category_li = highed.dom.ap(highed.dom.cr('li', 'fame-main-nav-li', 'Select category'), fame_category_ul),
						select_timeserie_counter_li = highed.dom.cr('li', 'select-timeserie-counter-li'),
						select_timeserie_filter_li = highed.dom.ap(highed.dom.cr('li', 'select-timeserie-filter-li'), 
															highed.dom.cr('p', 'timeS-filterTitle', 'Filter search:'), 
															highed.dom.cr('p', 'timeS-filterType', 'Region: All'),
															highed.dom.cr('p', 'timeS-filterType', 'Frequency: All'),
															highed.dom.cr('p', 'timeS-filterType', 'Datasource: All'),
															highed.dom.cr('p', 'timeS-filterType', 'Measure: All'),
															highed.dom.cr('p', 'timeS-filterType', 'Seasonal: All')),
						select_timeserie_ul_header = highed.dom.ap(highed.dom.cr('li', 'selectTimeSeries-ul-header'), 
																highed.dom.cr('p', 'header-text  desc', 'Description'),
																highed.dom.cr('p', 'header-text  h-name', 'Name'),
																highed.dom.cr('p', 'header-text  first-value', 'First value'),
																highed.dom.cr('p', 'header-text  last-value', 'Last value')),
						select_timeserie_ul = highed.dom.ap(highed.dom.cr('ul', 'timeSeries-ul'), 
													select_timeserie_counter_li, select_timeserie_filter_li, 
													select_timeserie_ul_header),
						select_timeserie_li = highed.dom.ap(highed.dom.cr('li', 'fame-main-nav-li', 'Select time series'), select_timeserie_ul),
						fame_timeserie_ul = highed.dom.cr('ul', 'selectTimeSeries-ul'),
						edit_timeserie_title = highed.dom.cr('li', 'timeserie-title-li'),
						edit_timeserie_expression_li = highed.dom.ap(highed.dom.cr('li', 'timeserie-info-li'), 
															highed.dom.cr('p', 'timeserie-info-li-p', 'Expression'), 
															highed.dom.cr('input', 'timeserie-info-li-input')),
						edit_timeserie_frequency_li = highed.dom.ap(highed.dom.cr('li', 'timeserie-info-li'), 
															highed.dom.cr('p', 'timeserie-info-li-p', 'Frequency'), 
															highed.dom.cr('select', 'timeserie-info-li-input')),
						edit_timeserie_frequency_li_select = edit_timeserie_frequency_li.getElementsByTagName('select')[0],
						edit_timeserie_range_li = highed.dom.ap(highed.dom.cr('li', 'timeserie-info-li'), 
																	highed.dom.cr('p', 'timeserie-info-li-p', 'Range'), 
																	highed.dom.cr('p', 'timeserie-range-from-p', 'From '), 
																	highed.dom.cr('input', 'timeserie-range-from-input'), 
																	highed.dom.cr('p', 'timeserie-range-to-p', 'To '), 
																	highed.dom.cr('input', 'timeserie-range-to-input')),
						edit_timeserie_other_li = highed.dom.ap(highed.dom.cr('li', 'timeserie-info-li'), highed.dom.cr('p', 'timeserie-info-li-p', 'Other'), highed.dom.cr('input', 'timeserie-info-li-input')),
						edit_timeserie_ul = highed.dom.ap(highed.dom.cr('ul', 'edit-timeSeries-ul'), edit_timeserie_title, edit_timeserie_expression_li, edit_timeserie_frequency_li, edit_timeserie_range_li, edit_timeserie_other_li),
						edit_timeserie_li = highed.dom.ap(highed.dom.cr('li', 'fame-main-nav-li', 'Edit time series'), edit_timeserie_ul),
						main_navigation_ul = highed.dom.ap(highed.dom.cr('ol', 'highed-plugin-fame-nav-ol'), select_category_li, select_timeserie_li, edit_timeserie_li),
						fame_category_cmd = "",
						timeserie_name = "",
						timeserie_channel = "",
						timeserie_frequency = "",
						timeserie_rangefrom = "",
						timeserie_rangeto = "",
						timeserie_lastUpdate = "";

						select_category_li.setAttribute('data-before',  '⮟');
						select_timeserie_li.setAttribute('data-before',  '⮟');
						edit_timeserie_li.setAttribute('data-before',  '⮟');
						
						await fameApiGET(webImports["FAME"].defaultURL, function (categories) { 
							categories.data.FameCategories.forEach(function (cat) {
								var sub_0_cat = highed.dom.cr('li', 'sub_0_li-element');
								sub_0_cat.innerHTML = cat.CategoryName;
								fame_category_ul.appendChild(sub_0_cat);
				
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

						await fameApiGET("http://epiwithfame.norwayeast.cloudapp.azure.com/api/fameintegration/getfrequencies", function(freq_opt) {
							freq_opt.data.Item.forEach(function(frequency) {
								var option = document.createElement("option");
								option.text = frequency;
								edit_timeserie_frequency_li_select.add(option);
							})
						})
		
						async function populateTimeSeries(array, parent) { 
							select_timeserie_counter_li.innerHTML = array.length + ' time series';

							Array.prototype.forEach.call(array, function (timeserie) {
								var timeserie_li = highed.dom.cr('li', 'timeserie-element');
								var variant_serie_ul = highed.dom.cr('ul', 'variant-serie-ul');
								
								if(timeserie.HasVintage === true) {
									timeserie_li.setAttribute('data-before', '⮞');
								}

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
								highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Name:'),  highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Name)),
								highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Datasource:'),  highed.dom.cr('p', 'timeserie-information-li-p', timeserie.DataSource)),
								highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Region:'),  highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Region)),
								highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Frequency:'),  highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Frequency)),
								highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'First value:'),  highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Firstvalue)),
								highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Last value:'),  highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Lastvalue)),
								highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Updated:'),  highed.dom.cr('p', 'timeserie-information-li-p', timeserie.LastUpdated)),
								highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Measure:'),  highed.dom.cr('p', 'timeserie-information-li-p', timeserie.Measure)),
								highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Vintage:'),  highed.dom.cr('p', 'timeserie-information-li-p', (timeserie.HasVintage) ? "TRUE" : "FALSE")),
								highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Vintage value:'),  highed.dom.cr('p', 'timeserie-information-li-p', (timeserie.VintValue === "") ? "NaN" : timeserie.VintValue))
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


								highed.dom.on(timeserie_li, 'click', async function(event) {
									event.stopPropagation();

									if(!variant_serie_ul.classList.contains("show")) {
										variant_serie_ul.classList.toggle("show");
										if(timeserie.HasVintage === true) timeserie_li.setAttribute('data-before', '⮟');
									}
									else {
										variant_serie_ul.classList.toggle("show");
										if(timeserie.HasVintage === true) timeserie_li.setAttribute('data-before', '⮞');
									}
									
									Array.prototype.forEach.call(fame_timeserie_ul.getElementsByClassName('timeserie-element'), function (timeserie_elm) {

										if(timeserie_li === timeserie_elm) {
											timeserie_li.classList.toggle("select");
											edit_timeserie_title.innerHTML = timeserie.Description + " " + timeserie.DataSource + ".";
											edit_timeserie_expression_li.getElementsByTagName('input')[0].value = timeserie.Name;

											var opts = edit_timeserie_frequency_li_select.options;
											for(var opt, j = 0; opt = opts[j]; j++) {
												if(opt.value === timeserie.Frequency) {
													edit_timeserie_frequency_li_select.selectedIndex = j;
													break;
												}
											}
											edit_timeserie_range_li.getElementsByTagName('input')[0].value = timeserie.Firstvalue;
											edit_timeserie_range_li.getElementsByTagName('input')[1].value = timeserie.Lastvalue;
											timeserie_name = timeserie.Name;
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
										else {
											if(timeserie_elm.classList.contains("select")) {
												timeserie_elm.classList.toggle("select");
											}
										}
									})

									await fameApiGET(webImports[name].timeSVintgs + timeserie.Name, function (timeserie_vintages) {
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
											highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Name:'),  highed.dom.cr('p', 'timeserie-information-li-p', vintage.Name)),
											highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Datasource:'),  highed.dom.cr('p', 'timeserie-information-li-p', vintage.DataSource)),
											highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Region:'),  highed.dom.cr('p', 'timeserie-information-li-p', vintage.Region)),
											highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Frequency:'),  highed.dom.cr('p', 'timeserie-information-li-p', vintage.Frequency)),
											highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'First value:'),  highed.dom.cr('p', 'timeserie-information-li-p', vintage.Firstvalue)),
											highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Last value:'),  highed.dom.cr('p', 'timeserie-information-li-p', vintage.Lastvalue)),
											highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Updated:'),  highed.dom.cr('p', 'timeserie-information-li-p', vintage.LastUpdated)),
											highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Measure:'),  highed.dom.cr('p', 'timeserie-information-li-p', vintage.Measure)),
											highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Vintage:'),  highed.dom.cr('p', 'timeserie-information-li-p', (vintage.HasVintage) ? "TRUE" : "FALSE")),
											highed.dom.ap(highed.dom.cr('li', 'timeserie-information-li'), highed.dom.cr('p', 'timeserie-information-li-p', 'Vintage value:'),  highed.dom.cr('p', 'timeserie-information-li-p', (vintage.VintValue === "") ? "NaN" : vintage.VintValue))
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

											highed.dom.on(vintage_li, 'click', function(event_2) {
												if(timeserie_li.classList.contains('select')) {
												timeserie_li.classList.toggle("select");
												}

												Array.prototype.forEach.call(variant_serie_ul.getElementsByTagName('li'), function (variant_li) {
													
													if (variant_li === vintage_li) {
														vintage_li.classList.toggle("select");
														timeserie_name = vintage.Name;
														edit_timeserie_title.innerHTML = vintage.Description + " " + vintage.DataSource + ".";

														var opts = edit_timeserie_frequency_li_select.options;
														for(var opt, j = 0; opt = opts[j]; j++) {
															if(opt.value === vintage.Frequency) {
																edit_timeserie_frequency_li_select.selectedIndex = j;
																break;
															}
														}

														edit_timeserie_expression_li.getElementsByTagName('input')[0].value = vintage.Name;
														edit_timeserie_range_li.getElementsByTagName('input')[0].value = vintage.Firstvalue;
														edit_timeserie_range_li.getElementsByTagName('input')[1].value = vintage.Lastvalue;
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
														if(variant_li.classList.contains('select')) {
															variant_li.classList.toggle("select");
														}
													}
								
												});
												event_2.stopPropagation();
											});
										});
									});
								})

								parent.appendChild(timeserie_li);
								parent.appendChild(variant_serie_ul);
							})
							highed.dom.ap(select_timeserie_ul, select_timeserie_counter_li, select_timeserie_filter_li, select_timeserie_ul_header, parent);
						}
						
						function addFilter(array) {
							Array.prototype.forEach.call(select_timeserie_filter_li.getElementsByClassName('timeS-filterType'), function(filter) {
								highed.dom.on(filter, 'click', function(filter_event) {
									if(fame_timeserie_ul.hasChildNodes()) {
										fame_timeserie_ul.querySelectorAll('*').forEach(n => n.remove());
									}
	
									switch (filter.innerHTML) {
											
										case 'Region: All':
											array = array.sort(function (a, b) {
												var regionA = a.Region.toUpperCase();
												var regionB = b.Region.toUpperCase();
												if(regionA < regionB) {
													return -1;
												}
												if(regionA > regionB) {
													return 1;
												}
												return 0;
											});
											populateTimeSeries(array, fame_timeserie_ul);
											break;
										
										case 'Frequency: All':
											array = array.sort(function (a, b) {
												var regionA = a.Frequency.toUpperCase();
												var regionB = b.Frequency.toUpperCase();
												if(regionA < regionB) {
													return -1;
												}
												if(regionA > regionB) {
													return 1;
												}
												return 0;
											});
											populateTimeSeries(array, fame_timeserie_ul);
											break;
										
										case 'Datasource: All':
											array = array.sort(function (a, b) {
												var regionA = a.DataSource.toUpperCase();
												var regionB = b.DataSource.toUpperCase();
												if(regionA < regionB) {
													return -1;
												}
												if(regionA > regionB) {
													return 1;
												}
												return 0;
											});
											populateTimeSeries(array, fame_timeserie_ul);
											break;
										
										case 'Measure: All':
											array = array.sort(function (a, b) {
												var regionA = a.Measure.toUpperCase();
												var regionB = b.Measure.toUpperCase();
												if(regionA < regionB) {
													return -1;
												}
												if(regionA > regionB) {
													return 1;
												}
												return 0;
											});
											populateTimeSeries(array, fame_timeserie_ul);
											break;
										
										case 'Seasonal: All':
											array = array.sort(function (a, b) {
												var regionA = a.Seasonal.toUpperCase();
												var regionB = b.Seasonal.toUpperCase();
												if(regionA < regionB) {
													return -1;
												}
												if(regionA > regionB) {
													return 1;
												}
												return 0;
											});
											populateTimeSeries(array, fame_timeserie_ul);
											break;
	
										default:
											break;
									}
	
									filter_event.stopPropagation();
								})
							});
						}
					
						highed.dom.on(select_category_li, 'click', function() {
							if(!fame_category_ul.classList.contains("show")) {
								fame_category_ul.classList.toggle("show");
							   select_category_li.setAttribute('data-before',  '⮝');
							}
							else {
								fame_category_ul.classList.toggle("show");
								select_category_li.setAttribute('data-before',  '⮟');
							}
							
							var subcat_0_elements = document.getElementsByClassName('sub_0_li-element');
							var subcat_1_elements; 
							Array.prototype.forEach.call(subcat_0_elements, function (subcat_0_elm) {
								subcat_0_elm.setAttribute('data-before', '⮞');
								subcat_1_elements = subcat_0_elm.children[0].children;

								highed.dom.on(subcat_0_elm, 'click', function (event) {

									if(!subcat_0_elm.getElementsByTagName('ul')[0].classList.contains("show")){
										subcat_0_elm.getElementsByTagName('ul')[0].classList.toggle("show");
										subcat_0_elm.setAttribute('data-before', '⮟');
									}
									else {
										subcat_0_elm.getElementsByTagName('ul')[0].classList.toggle("show");
										subcat_0_elm.setAttribute('data-before', '⮞');
									}
									event.stopPropagation();
								})

								Array.prototype.forEach.call(subcat_1_elements, function (subcat_1_elm) {
										
									if(subcat_1_elm.getElementsByTagName('ul').length > 0) {
									   subcat_1_elm.setAttribute('data-before', '⮞');
									}

									highed.dom.on(subcat_1_elm, 'click', async function (event) {
										
										if(subcat_1_elm.getElementsByTagName('ul').length > 0) {
											if(!subcat_1_elm.getElementsByTagName('ul')[0].classList.contains("show")){
												subcat_1_elm.getElementsByTagName('ul')[0].classList.toggle("show");
												subcat_1_elm.setAttribute('data-before', '⮟');
											}
											else  {
												subcat_1_elm.getElementsByTagName('ul')[0].classList.toggle("show");
												subcat_1_elm.setAttribute('data-before', '⮞');
											}
									
											var subcat_2_elements = subcat_1_elm.children[0].children;	
											
											Array.prototype.forEach.call(subcat_2_elements, function (subcat_2_elm) {
												highed.dom.on(subcat_2_elm, 'click', async function (event_2) {

													if(subcat_2_elm.parentNode.parentNode.parentNode.classList.contains("show")) {
														subcat_2_elm.parentNode.parentNode.parentNode.classList.toggle("show");
														subcat_2_elm.parentNode.parentNode.parentNode.parentNode.setAttribute('data-before', '⮞');
								
													}
													if(!select_timeserie_ul.classList.contains("show")){
														select_timeserie_ul.classList.toggle("show");
													}
													fame_category_cmd = subcat_2_elm.getAttribute('data-command');

													if(fame_timeserie_ul.hasChildNodes()) {
														fame_timeserie_ul.querySelectorAll('*').forEach(n => n.remove());
													}

													await fameApiGET(webImports[name].timeSURL + fame_category_cmd, function(categoryTimeseries) {
														populateTimeSeries(categoryTimeseries.data, fame_timeserie_ul);
														addFilter(categoryTimeseries.data);
													
													})
													event_2.stopPropagation();
												})
											})
										}
										else {

											fame_category_cmd = subcat_1_elm.getAttribute('data-command');
											if(fame_timeserie_ul.hasChildNodes()) {
												fame_timeserie_ul.querySelectorAll('*').forEach(n => n.remove());
											}
											await fameApiGET(webImports[name].timeSURL + fame_category_cmd, function(categoryTimeseries) {						
												populateTimeSeries(categoryTimeseries.data, fame_timeserie_ul);
												addFilter(categoryTimeseries.data);
											})
											if(!select_timeserie_ul.classList.contains("show")){
												select_timeserie_ul.classList.toggle("show");
											}
										}
										event.stopPropagation();
									})
								})	
							})						
						})

						highed.dom.on(select_timeserie_li, 'click', function() {
							if(fame_category_cmd === "") {
								alert("You must choose a category before selecting a time series!");
							}
							else {
								if(!select_timeserie_ul.classList.contains("show")) {
									select_timeserie_ul.classList.toggle("show");
									select_timeserie_li.setAttribute('data-before',  '⮝');
								}
								else {
									select_timeserie_ul.classList.toggle("show");
									select_timeserie_li.setAttribute('data-before',  '⮟');
								}							
							}
							
						})

						highed.dom.on(edit_timeserie_li, 'click', function() {
							if(timeserie_name === "") {
								alert("You must choose a timeseries before being able to edit it!")
							}
							else {
								if(select_timeserie_ul.classList.contains("show")) {
									select_timeserie_ul.classList.toggle("show");
									select_timeserie_li.setAttribute('data-before',  '⮟');
								}
								if(!edit_timeserie_ul.classList.contains("show")){
									edit_timeserie_ul.classList.toggle("show");
									edit_timeserie_li.setAttribute('data-before',  '⮝');
								}
								else {
									edit_timeserie_ul.classList.toggle("show");
									edit_timeserie_li.setAttribute('data-before',  '⮟');
								}

								Array.prototype.forEach.call(edit_timeserie_li.getElementsByTagName('ul')[0].getElementsByTagName('li'), function (item) {
									highed.dom.on(item, 'click', function (event) {
										event.stopPropagation();
									})
								})
							}
						})
	
						highed.dom.on(import_timeserie_btn, 'click', function() {
							highed.snackBar('Importing ' + name + ' data');
							timeserie_name = edit_timeserie_expression_li.getElementsByTagName('input')[0].value;
							timeserie_frequency = edit_timeserie_frequency_li_select[edit_timeserie_frequency_li_select.selectedIndex].value;
							timeserie_rangefrom = edit_timeserie_range_li.getElementsByTagName('input')[0].value;
							timeserie_rangeto = edit_timeserie_range_li.getElementsByTagName('input')[1].value;
							timeserie_other = edit_timeserie_other_li.getElementsByTagName('input')[0].value;

							if(timeserie_rangefrom.includes(".")) {
								timeserie_rangefrom = timeserie_rangefrom.split(".");
								timeserie_rangefrom = timeserie_rangefrom[2] + "-" + timeserie_rangefrom[0] + "-" + timeserie_rangefrom[1]
							}
							if(timeserie_rangeto.includes(".")) {
								timeserie_rangeto = timeserie_rangeto.split(".");
								timeserie_rangeto = timeserie_rangeto[2] + "-" + timeserie_rangeto[0] + "-" + timeserie_rangeto[1]
							}
							
							highed.ajax({
								url: "http://epiwithfame.norwayeast.cloudapp.azure.com/api/fameintegration/getobservations?channelname=" + timeserie_channel + "&expression="+ timeserie_name + "&frequency=" + timeserie_frequency +"&rangefrom=" + timeserie_rangefrom + "&rangeto="+ timeserie_rangeto + "&timeSerieLastUpdated=" + timeserie_lastUpdate + "&other=" + timeserie_other,
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
														newDataArray.push(lineArr.join(','));

													}

												});
												csvPasteArea.value = newDataArray.join('\n');
											}
											else {
												// console.log(val)
												csvPasteArea.value = val;
											}
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
														newDataArray.push(lineArr.join(','));

													}

												});
												csvPasteArea.value = newDataArray.join('\n');
											}
											else {
												// console.log(val)
												csvPasteArea.value = val;
											}
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
									highed.dom.cr('div', 'highed-plugin-fame-title highed-customizer-table-heading', name + ' - Search for time series'),
									main_navigation_ul,
									highed.dom.cr('br'),
									import_timeserie_btn
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
