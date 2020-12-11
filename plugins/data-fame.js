highed.plugins.import.install('FAME', {
    description: 'Append data fra FAME',
    treatAs: 'csv-append',
    fetchAs: 'json',
    defaultURL: 'https://epiwithfame.norwayeast.cloudapp.azure.com/api/fameintegration/getcategories',
    timeSURL: 'https://epiwithfame.norwayeast.cloudapp.azure.com/api/fameintegration/getseriesbycategory?category=',
    timeSVintgs: 'https://epiwithfame.norwayeast.cloudapp.azure.com/api/fameintegration/getvintagesbyseriename?serie=',
    options: {
        includeFields: {
			type: 'string',
			label: 'Fields to include, separate by semicolon',
			default: 'FameCategories'
		}
    },
    filter: function (data, options, fn) {

    //     var csv = [], header = [];

		try {
			data = JSON.parse(data);
		} catch (e) {
			fn(e);
		}

	// 	options.includeFields = highed.arrToObj(options.includeFields.split(';'));

	// 	if (highed.isArr(data.entries)) {

	// 		//Only include things we're interested in
	// 		data.entries = data.entries.map(function (d) {
	// 			var r = {};
	// 			Object.keys(options.includeFields).forEach(function (c) {
	// 				r[c] = d[c];
	// 			});
	// 			return r;
	// 		});

	// 		//Denne kan skilles ut og gjenbrukes
	// 		data.entries.forEach(function (row, i) {
	// 			var rdata = [];

	// 			Object.keys(row).forEach(function (key) {
	// 				var col = row[key];

	// 				if (!options.includeFields[key]) {
	// 					return;
	// 				}

	// 				if (i == 0) {
	// 					header.push(key);
	// 				}
	// 				rdata.push(col);

	// 			});
	// 			csv.push(rdata.join(','));
	// 		});
	// 	}
	// 	var tt = [header.join(',')].concat(csv).join('\n');
	// 	fn(false, tt);
     }
});