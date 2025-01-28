import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeFr, 'fr');
registerLocaleData(localeEs, 'es');

// Qt stuff
const globals = window as any;

if (globals.qt) {
  try {
    import(
      /* webpackChunkName: "qwebchannel" */ './scripts/qwebchannel.js'
    ).then(() => {
      globals.qWebChannelInstance = new globals.QWebChannel(
        globals.qt.webChannelTransport,
        function (channel) {
          globals.qml = channel.objects.qml;

          function decorateOutput(fn, prefix: string) {
            return (...messages) => {
              fn(...messages);
              for (const message of messages) {
                globals.qml.qmlLog(`${prefix} ${message}`);
              }
            };
          }

          // Redirect output
          console.log = decorateOutput(console.log, '[browser->console.log]');
          console.warn = decorateOutput(
            console.warn,
            '[browser->console.warn]'
          );
          console.error = decorateOutput(
            console.error,
            '[browser->console.error]'
          );
        }
      );
    });
  } catch (e) {
    console.log('Detected qt but encountered error loading qml', e);
  }
}

// end qt stuff

//  Bootstrap in timeout to reduce frame drops on low power devices
setTimeout(() => {
  if (environment.production) {
    enableProdMode();
  }

  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
});
