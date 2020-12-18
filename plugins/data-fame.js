highed.plugins.import.install('FAME', {
    description: 'Append data fra FAME',
    treatAs: 'csv-append',
    fetchAs: 'json',
    defaultURL: 'http://epiwithfame.norwayeast.cloudapp.azure.com/api/fameintegration/getcategories',
    timeSURL: 'http://epiwithfame.norwayeast.cloudapp.azure.com/api/fameintegration/getseriesbycategory?category=',
    timeSVintgs: 'http://epiwithfame.norwayeast.cloudapp.azure.com/api/fameintegration/getvintagesbyseriename?serie=',
    options: {
        includeFields: {
			type: 'string',
			label: 'Fields to include, separate by semicolon',
			default: 'Date;Value'
		}
    },
    filter: function (data, options, fn) {

        var csv = [], header = [];

		try {
			data = JSON.parse(data);
		} catch (e) {
			fn(e);
		}

		 options.includeFields = highed.arrToObj(options.includeFields.split(';'));
		 console.log(data.data)
		if (highed.isArr(data.data.Observationsens)) {

			//Only include things we're interested in
			data.data.Observationsens = data.data.Observationsens.map(function (d) {
				var r = {};
				Object.keys(options.includeFields).forEach(function (c) {
					r[c] = d[c];
				});
				return r;
			});

			//Denne kan skilles ut og gjenbrukes
			data.data.Observationsens.forEach(function (row, i) {
				var rdata = [];

				Object.keys(row).forEach(function (key) {
					var col = row[key];

					if (!options.includeFields[key]) {
						return;
					}

					if (i == 0) {
						if(key === "Value") {
							header.push(JSON.stringify(data.data.Series[0].Description));
						} else {
							header.push(key);
						}
					}
					if(col === "NaN") {
						rdata.push("");
					}
					else {
						rdata.push(col);
					}
				});
				csv.push(rdata.join(','));
			});
		}
		var tt = [header.join(',')].concat(csv).join('\n');
		fn(false, tt);
     }
});