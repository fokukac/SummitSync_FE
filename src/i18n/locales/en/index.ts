import activities from './activities';
import auth from './auth';
import common from './common';
import events from './events';
import groups from './groups';
import landing from './landing';
import search from './search';
import settings from './settings';

export default {
    ...common,
    ...activities,
    ...auth,
    ...landing,
    ...groups,
    ...events,
    ...settings,
    ...search,
};
