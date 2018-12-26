import {
    coreLibrary,
    eventsModule,
    widgetModule,
} from 'kambi-widget-core-library'
import kambi from './Services/kambi'
import Widget from './Widget'

import {supportedFilters} from './constants'
import toastr from 'toastr';
import {getCIDOrDefault} from './Services/helper';

/**
 * Removes widget on fatal errors.
 * @param {Error} error Error instance
 */
const onFatal = function (error) {
    console.error(error)
    document.writeln(error);
    // widgetModule.removeWidget()
}

coreLibrary
    .init({
        widgetTrackingName: 'gm-match-overview-widget',
        compareAgainstHighlights: false,
        filter: supportedFilters,
        combineFilters: true,
        pollingInterval: 5000,
        pollingCount: 100,
        eventsRefreshInterval: 5000,
    })
    .then(() => {
        toastr.options.showEasing = 'swing';
        toastr.options.hideEasing = 'linear';
        toastr.options.closeEasing = 'linear';
        toastr.options.positionClass = 'toast-bottom-full-width';
        console.log('----------coreLibrary.args------');
        console.log(coreLibrary.args);

        coreLibrary.widgetTrackingName = coreLibrary.args.widgetTrackingName
        eventsModule.liveEventPollingInterval = coreLibrary.args.pollingInterval
        return coreLibrary.args.compareAgainstHighlights // set this arg to false to test specific filters
            ? kambi.getHighlightedFilters(coreLibrary.args.filter)
            : coreLibrary.args.filter
    })
    .then(filters => {
        if (filters.length === 0) {
            onFatal(new Error('No matching filters in highlight'))
            return
        }

        const widget = new Widget(filters, {
            combineFilters: coreLibrary.args.combineFilters,
            eventsRefreshInterval: coreLibrary.args.eventsRefreshInterval,
            pollingCount: 100,//coreLibrary.args.pollingCount,
            onFatal,
        })
        let cid = getCIDOrDefault();
        kambi.getUserTeams(cid).then((res) => {
            if (!res) {
                return kambi.getUserTeams(cid, true);
            } else {
                return res;
            }

        }).then((res) => {
            let user = res.data ? res.data : res;
            return widget.init(user);
        });


    })
    .catch(onFatal)
