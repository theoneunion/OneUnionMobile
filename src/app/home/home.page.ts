import {Component, OnDestroy} from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { Platform } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

// export interface Navigator {
//     app: {
//         exitApp: () => any,
//     };
// }

export class HomePage implements OnDestroy {

    websiteOpened = false;
    networkStatus = null;
    disconnectSubscription = null;
    connectSubscription = null
    showConnectionError = false;

    constructor(
        private inAppBrowser: InAppBrowser,
        private network: Network,
        public plt: Platform
    ) {
        this.plt.ready().then((readySource) => {
            console.log('Platform ready from', readySource);
            // Platform now ready, execute any required native code
            this.initApp();
        });
    }

    initApp(): void {
        console.log('.initApp network connection: ', navigator.onLine);
        this.networkStatus = navigator.onLine;
        if (navigator.onLine) {
            // if (this.plt.is('ios') || this.plt.is('android') ) {
                this.openWebsite();
            // }
        } else {
            // watch network for a disconnection
            this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
                console.log('network was disconnected :-(');
            });

            // watch network for a connection
            this.connectSubscription = this.network.onConnect().subscribe(() => {
                // console.log('network connected!');
                // We just got a connection but we need to wait briefly
                // before we determine the connection type. Might need to wait.
                // prior to doing any api requests as well.
                setTimeout(() => {
                    // if (this.network.type === 'wifi') {
                    //     // console.log('we got a wifi connection, woohoo!');
                    // }
                    this.networkStatus = navigator.onLine;
                    if (!this.websiteOpened) {
                        this.openWebsite();
                    }
                }, 3000);
            });

            setTimeout(() => {
                if (!this.websiteOpened) {
                    this.showConnectionError = true;
                }
            }, 10000);
        }
    }

    openWebsite(): void {
        const options: InAppBrowserOptions = {
            location : 'no', // Or 'no'
            hidden : 'no', // Or  'yes'
            clearcache : 'yes',
            clearsessioncache : 'yes',
            zoom : 'no', // Android only ,shows browser zoom controls
            hardwareback : 'yes',
            mediaPlaybackRequiresUserAction : 'no',
            shouldPauseOnSuspend : 'no', // Android only
            closebuttoncaption : 'Close', // iOS only
            disallowoverscroll : 'no', // iOS only
            toolbar : 'yes', // iOS only
            enableViewportScale : 'no', // iOS only
            allowInlineMediaPlayback : 'no', // iOS only
            presentationstyle : 'pagesheet', // iOS only
            fullscreen : 'yes', // Windows only
        };
        const browser = this.inAppBrowser.create(
            'http://app.theoneunion.com',
            '_self',
            options
        );
        browser.on('exit').subscribe(() => {
            console.log('browser closed');
            navigator['app'].exitApp();
        }, err => {
            console.error(err);
            navigator['app'].exitApp();
        });
        this.websiteOpened = true;
    }

    ngOnDestroy(): void {
        if (this.connectSubscription !== null) {
            this.disconnectSubscription.unsubscribe();
            this.connectSubscription.unsubscribe();
        }
    }
}
