highed.templates.add('Column', {
    title: 'Waterfall columns',
    description: 'This is a waterfall column chart',
    dataValidator: false,
    sampleSets: [],
    config: {
      chart: {
        type: 'waterfall',
      },
     xAxis: {
         type: 'category'
     },
     plotOptions: {
      series: {
        additionalMetaDataTest: 'test'
      }
    }
    }
  });
  