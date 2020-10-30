highed.plugins.import.install('Apiary', {
	description: 'Append data fra ApiAry',
	treatAs: 'csv-append',
	fetchAs: 'json',
	defaultURL: 'https://private-323c20-highcharts1.apiary-mock.com/api/highcharts/project/2',
	options: {
		includeFields: {
			type: 'string',
			label: 'Fields to include, separate by semicolon',
			default: 'Fylke;Antall innbyggere'
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

		if (highed.isArr(data.entries)) {

			//Only include things we're interested in
			data.entries = data.entries.map(function (d) {
				var r = {};
				Object.keys(options.includeFields).forEach(function (c) {
					r[c] = d[c];
				});
				return r;
			});

			//Denne kan skilles ut og gjenbrukes
			data.entries.forEach(function (row, i) {
				var rdata = [];

				Object.keys(row).forEach(function (key) {
					var col = row[key];

					if (!options.includeFields[key]) {
						return;
					}

					if (i == 0) {
						header.push(key);
					}
					rdata.push(col);

				});
				csv.push(rdata.join(','));
			});
		}
		var tt = [header.join(',')].concat(csv).join('\n');
		fn(false, tt);
	}
}
);
