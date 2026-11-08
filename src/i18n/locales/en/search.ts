import type { Message } from '@/i18n';

export default {
    'search.title': 'Search',
    'search.description': 'Find groups, events and people in your groups',
    'search.placeholder': 'Search groups, events and people…',
    'search.groupsPlaceholder': 'Search groups…',
    'search.hint': 'Type at least 2 characters to search.',
    'search.groups': 'Groups',
    'search.events': 'Events',
    'search.members': 'People',
    'search.noResults': 'Nothing matches “{query}”.',
    'search.noGroups': 'No groups match “{query}”.',
    'search.scopeHint':
        'Events and people are only searched in groups you are a member of.',
    'search.clear': 'Clear search',
} satisfies Record<string, Message>;
