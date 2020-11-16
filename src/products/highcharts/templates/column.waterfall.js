highed.templates.add('Column', {
    title: 'Waterfall columns',
    description: 'This is a waterfall column chart',
    thumbnail: 'waterfall.png',
    dataValidator: false,
    sampleSets: [],
    config: {
      chart: {
        type: 'waterfall',
      },
     xAxis: {
         type: 'category'
     }
    }
  });
  