import {
    coreLibrary,
    eventsModule,
    widgetModule,
} from 'kambi-widget-core-library'
import kambi from './Services/kambi'
import Widget from './Widget'

import {supportedFilters} from './constants'
import toastr from 'toastr';

/**
 * Removes widget on fatal errors.
 * @param {Error} error Error instance
 */
const onFatal = function (error) {
    console.error(error)
    widgetModule.removeWidget()
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
        toastr.options.positionClass = 'toast-bottom-right';
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

        return widget.init()
    })
    .catch(onFatal)
