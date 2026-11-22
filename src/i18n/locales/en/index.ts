import activities from './activities';
import auth from './auth';
import common from './common';
import events from './events';
import groups from './groups';
import landing from './landing';
import privacy from './privacy';
import search from './search';
import settings from './settings';

export default {
    ...common,
    ...activities,
    ...auth,
    ...landing,
    ...privacy,
    ...groups,
    ...events,
    ...settings,
    ...search,
};
