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
         type: 'category',
         minorTickLength: 0,
         tickLength: 0,
         tickWidth: 1,
         lineColor: '#000000',
         labels: {
           style: {
               color: '#000000'
           }
         },
         lineWidth: 1 
     }
    }
  });
  