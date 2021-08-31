import { Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4plugins from '@amcharts/amcharts4/plugins/sunburst';
import am4themes_material from '@amcharts/amcharts4/themes/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'graph-pwa';

  private chart: am4charts.XYChart;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId,
    private zone: NgZone
  ) {}

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  ngOnInit() {
    let countriesList =
      'India, Nepal, Bangladesh, Pakistan, Bhutan, Sri Lanka, Maldives';
    this.http
      .get(`https://corona.lmao.ninja/v2/countries/${countriesList}?yesterday=`)
      .subscribe({
        next(response: any) {
          // am4core.useTheme(am4themes_animated);
          // am4core.useTheme(am4themes_material);

          let chart = am4core.create('chartdiv', am4plugins.Sunburst);
          chart.padding(0, 0, 0, 0);
          chart.radius = am4core.percent(98);

          let chartData = [];

          response.map(item => {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)];
            }

            let itemInfo = {};
            itemInfo['name'] = item.country != undefined ? item.country : '';

            itemInfo['children'] = [];

            itemInfo['children'].push({
              name: 'Total Cases',
              color: am4core.color(color),
              children: [
                {
                  name: 'Recovered',
                  value: item.recovered
                },
                {
                  name: 'Deaths',
                  value: item.deaths
                },
                {
                  name: 'Active',
                  value: item.active
                }
              ]
            });

            chartData.push(itemInfo);
          });

          chart.data = chartData;

          chart.colors.step = 2;
          chart.fontSize = 11;
          chart.innerRadius = am4core.percent(10);

          // define data fields
          chart.dataFields.value = 'value';
          chart.dataFields.name = 'name';
          chart.dataFields.children = 'children';

          let level0SeriesTemplate = new am4plugins.SunburstSeries();
          level0SeriesTemplate.hiddenInLegend = false;
          chart.seriesTemplates.setKey('0', level0SeriesTemplate);

          // this makes labels to be hidden if they don't fit
          level0SeriesTemplate.labels.template.truncate = true;
          level0SeriesTemplate.labels.template.hideOversized = true;

          level0SeriesTemplate.labels.template.adapter.add('rotation', function(
            rotation,
            target
          ) {
            target.maxWidth =
              target.dataItem.slice.radius -
              target.dataItem.slice.innerRadius -
              10;
            target.maxHeight = Math.abs(
              ((target.dataItem.slice.arc *
                (target.dataItem.slice.innerRadius +
                  target.dataItem.slice.radius)) /
                2) *
                am4core.math.RADIANS
            );

            return rotation;
          });

          let level1SeriesTemplate = level0SeriesTemplate.clone();
          chart.seriesTemplates.setKey('1', level1SeriesTemplate);
          level1SeriesTemplate.fillOpacity = 0.75;
          level1SeriesTemplate.hiddenInLegend = true;

          let level2SeriesTemplate = level0SeriesTemplate.clone();
          chart.seriesTemplates.setKey('2', level2SeriesTemplate);
          level2SeriesTemplate.fillOpacity = 0.5;
          level2SeriesTemplate.hiddenInLegend = true;

          chart.legend = new am4charts.Legend();
        },
        error(err) {
          console.log('Error: ', err);
        }
      });
  }

  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
