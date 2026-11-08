import type { Message } from '@/i18n';

export default {
    'settings.title': 'Settings',
    'settings.description': 'Manage your profile and account settings',
    'settings.profile.head': 'Profile settings',
    'settings.profile.title': 'Profile information',
    'settings.profile.description':
        'Update your name, username, email address, and language',
    'settings.profile.unverified': 'Your email address is unverified.',
    'settings.profile.resend': 'Click here to resend the verification email.',
    'settings.profile.linkSent':
        'A new verification link has been sent to your email address.',
    'settings.profile.language': 'Language',
    'settings.profile.photo.upload': 'Upload photo',
    'settings.profile.photo.change': 'Change photo',
    'settings.profile.photo.remove': 'Remove photo',
    'settings.profile.photo.hint':
        'JPG, PNG or WebP, up to 5 MB. Cropped to a square.',
    'settings.security.head': 'Security settings',
    'settings.security.password.title': 'Update password',
    'settings.security.password.description':
        'Ensure your account is using a long, random password to stay secure',
    'settings.security.password.setTitle': 'Set a password',
    'settings.security.password.setDescription':
        'Your account was created with a social login, so it has no password yet. Set one if you also want to sign in with your email.',
    'settings.security.currentPassword': 'Current password',
    'settings.security.newPassword': 'New password',
    'settings.security.save': 'Save password',
    'settings.security.twofa.description':
        'Manage your two-factor authentication settings',
    'settings.security.twofa.needsPassword':
        'Set a password above to enable two-factor authentication.',
    'settings.security.twofa.off':
        'When you enable two-factor authentication, you will be prompted for a secure pin during login. This pin can be retrieved from a TOTP-supported application on your phone.',
    'settings.security.twofa.continueSetup': 'Continue setup',
    'settings.security.twofa.enable': 'Enable 2FA',
    'settings.security.twofa.on':
        'You will be prompted for a secure, random pin during login, which you can retrieve from the TOTP-supported application on your phone.',
    'settings.security.twofa.disable': 'Disable 2FA',
    'settings.appearance.title': 'Appearance settings',
    'settings.appearance.description':
        "Update your account's appearance settings",
    'settings.delete.title': 'Delete account',
    'settings.delete.description':
        'Delete your account and all of its resources',
    'settings.delete.warning': 'Warning',
    'settings.delete.caution':
        'Please proceed with caution, this cannot be undone.',
    'settings.delete.confirmTitle':
        'Are you sure you want to delete your account?',
    'settings.delete.confirmDescription':
        'Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.',
    'twofa.enabled.title': 'Two-factor authentication enabled',
    'twofa.enabled.description':
        'Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.',
    'twofa.verify.title': 'Verify authentication code',
    'twofa.verify.description':
        'Enter the 6-digit code from your authenticator app',
    'twofa.enable.title': 'Enable two-factor authentication',
    'twofa.enable.description':
        'To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app',
    'twofa.manualCode': 'or, enter the code manually',
    'twofa.fetchQrFailed': 'Failed to fetch QR code',
    'twofa.fetchKeyFailed': 'Failed to fetch a setup key',
    'twofa.fetchCodesFailed': 'Failed to fetch recovery codes',
    'twofa.recovery.title': '2FA recovery codes',
    'twofa.recovery.description':
        'Recovery codes let you regain access if you lose your 2FA device. Store them in a secure password manager.',
    'twofa.recovery.view': 'View recovery codes',
    'twofa.recovery.hide': 'Hide recovery codes',
    'twofa.recovery.regenerate': 'Regenerate codes',
    'twofa.recovery.hintBefore':
        'Each recovery code can be used once to access your account and will be removed after use. If you need more, click',
    'twofa.recovery.hintAfter': 'above.',
    'settings.theme.title': 'Colour theme',
    'settings.theme.description':
        'Choose the look of the app. Works together with light / dark mode.',
    'theme.darkOnly': 'dark only',
    'theme.alpine.name': 'Alpine',
    'theme.alpine.description': 'Forest green and warm cream (default)',
    'theme.topo.name': 'Topo',
    'theme.topo.description': 'Teal and blue, contour-line accents',
    'theme.trail.name': 'Dark trail',
    'theme.trail.description': 'Dark with a lime accent, compact',
    'theme.sunrise.name': 'Sunrise',
    'theme.sunrise.description': 'Warm orange, very rounded',
    'theme.editorial.name': 'Editorial',
    'theme.editorial.description': 'Black and white, serif headings',
    'theme.glacier.name': 'Glacier',
    'theme.glacier.description': 'Cool blue gradient, frosted cards',
    'settings.density.title': 'Density',
    'settings.density.description':
        'Make the interface more compact or more spacious.',
    'density.condensed': 'Condensed',
    'density.normal': 'Normal',
    'density.relaxed': 'Relaxed',
    'settings.fontSize.title': 'Font size',
    'settings.fontSize.description': 'Make text smaller or larger.',
    'fontSize.small': 'Small',
    'fontSize.medium': 'Medium',
    'fontSize.large': 'Large',
    'settings.profile.saving': 'Saving…',
    'settings.profile.autosave': 'Changes are saved automatically.',
    'settings.email.change': 'Change email',
    'settings.email.change.title': 'Change email address',
    'settings.email.change.description':
        'We will send a confirmation link to the new address. Your current address stays active until you confirm it.',
    'settings.email.new': 'New email address',
    'settings.email.password': 'Current password',
    'settings.email.send': 'Send confirmation link',
    'settings.email.locked':
        'Your email is managed by your Google/Facebook login and cannot be changed here.',
    'settings.email.pending':
        'Waiting for confirmation of {email}. Check that inbox for the link.',
    'settings.email.cancel': 'Cancel change',
} satisfies Record<string, Message>;
