import type { Message } from '@/i18n';

export default {
    'privacy.head': 'Privacy policy',
    'privacy.link': 'Privacy policy',
    'privacy.title': 'Privacy policy',
    'privacy.updated': 'Last updated: {date}',
    'privacy.intro':
        'SummitSync helps groups plan outdoor trips. This page explains what personal data the service handles, why, and what your rights are.',

    'privacy.controller.title': 'Who is responsible',
    'privacy.controller.text':
        'SummitSync is run by {name}, as an individual, who is the controller of your personal data. For any privacy question or request, write to {email}.',

    'privacy.data.title': 'What data we handle',
    'privacy.data.account':
        'Account: your name, username, email address, language, a password (stored only as a hash) and, if you turn it on, two-factor authentication settings.',
    'privacy.data.photo':
        'Profile photo: optional, uploaded by you or taken from your Google account when you sign in with Google.',
    'privacy.data.content':
        'What you create: groups, events, meeting points, checklists, polls and votes, and chat messages. The other members of the groups and events you take part in can see them.',
    'privacy.data.google':
        'Google sign-in: if you choose it, we receive your Google account id, name, email address and profile picture. We never receive your Google password and ask for no other Google data.',
    'privacy.data.technical':
        'Technical data: your IP address, browser or app type and sign-in sessions, used to keep the service secure (for example limiting repeated attempts) and to find and fix errors.',

    'privacy.use.title': 'Why we use it',
    'privacy.use.text':
        'To run the service you signed up for (account, groups, events, chat, emails such as the verification message) and to keep it secure and working. We do not sell your data, show advertising or use tracking or analytics services.',

    'privacy.share.title': 'Who else handles it',
    'privacy.share.hosting':
        'Hosting: a virtual server provided by Hostinger in the European Union.',
    'privacy.share.email':
        'Email delivery: Brevo sends our emails (verification, password reset).',
    'privacy.share.errors':
        'Error reports: Sentry (EU region) receives technical error reports from our servers. We do not send personal data to it by default.',
    'privacy.share.google': 'Google: only if you use Google sign-in.',
    'privacy.share.places':
        'Place search: the text you type when searching for a meeting place is sent from our server to the Photon service (OpenStreetMap data), without your account details.',
    'privacy.share.shops':
        'Shopping suggestions link to partner shops. If you follow a link you leave SummitSync and the shop’s own policy applies.',

    'privacy.rights.title': 'Your rights',
    'privacy.rights.text':
        'You can ask us for a copy of your data, to correct it, to restrict or object to its use, and to receive it in a portable format. Write to {email}; we answer within one month.',
    'privacy.rights.delete':
        'Deleting your account: in Settings you can delete your account, which signs you out and removes your profile from view. To have the remaining data erased, write to {email}. Messages you posted in shared groups can be removed on request.',
    'privacy.rights.complaint':
        'You can also complain to your national data protection authority.',

    'privacy.cookies.title': 'Cookies',
    'privacy.cookies.text':
        'We only use what the site needs to work: a sign-in session, a security token and your display preferences (such as theme and language) stored in your browser. There are no advertising or tracking cookies.',
} satisfies Record<string, Message>;
