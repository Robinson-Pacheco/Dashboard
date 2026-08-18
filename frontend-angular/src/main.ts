import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Register Chart.js and AG Charts modules
import { Chart, registerables } from 'chart.js';
import { ModuleRegistry } from 'ag-charts-enterprise';
import { BoxPlotSeriesModule, CategoryAxisModule, NumberAxisModule, LegendModule } from 'ag-charts-enterprise';

// Register Chart.js defaults
Chart.register(...registerables);

// Register AG Charts Enterprise modules for box plot
ModuleRegistry.registerModules([
  BoxPlotSeriesModule,
  CategoryAxisModule,
  NumberAxisModule,
  LegendModule
]);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
