import type { Message } from '@/i18n';

export default {
    'auth.tagline': 'Agree on the plan. Meet at the trailhead.',
    'auth.taglineSub':
        'Groups, events, chat, polls and packing lists for every ride, hike and tour.',
    'auth.email': 'Email address',
    'auth.emailShort': 'Email',
    'auth.emailPlaceholder': 'email@example.com',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm password',
    'auth.name': 'Name',
    'auth.namePlaceholder': 'Full name',
    'auth.username': 'Username',
    'auth.usernamePlaceholder': 'username',
    'auth.login.title': 'Log in to your account',
    'auth.login.description': 'Enter your email and password below to log in',
    'auth.forgot': 'Forgot password?',
    'auth.remember': 'Remember me',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.register.head': 'Register',
    'auth.register.title': 'Create an account',
    'auth.register.description':
        'Enter your details below to create your account',
    'auth.register.submit': 'Create account',
    'auth.forgot.title': 'Forgot password',
    'auth.forgot.description':
        'Enter your email to receive a password reset link',
    'auth.forgot.submit': 'Email password reset link',
    'auth.forgot.return': 'Or, return to',
    'auth.forgot.loginLink': 'log in',
    'auth.reset.title': 'Reset password',
    'auth.reset.description': 'Please enter your new password below',
    'auth.confirm.title': 'Confirm your password',
    'auth.confirm.description':
        'This is a secure area of the application. Please confirm your password before continuing.',
    'auth.verify.head': 'Email verification',
    'auth.verify.title': 'Verify email',
    'auth.verify.description':
        'Please verify your email address by clicking on the link we just emailed to you.',
    'auth.verify.sent':
        'A new verification link has been sent to the email address you provided during registration.',
    'auth.verify.resend': 'Resend verification email',
    'auth.twofa.head': 'Two-factor authentication',
    'auth.twofa.code.title': 'Authentication code',
    'auth.twofa.code.description':
        'Enter the authentication code provided by your authenticator application.',
    'auth.twofa.code.toggle': 'login using a recovery code',
    'auth.twofa.recovery.title': 'Recovery code',
    'auth.twofa.recovery.description':
        'Please confirm access to your account by entering one of your emergency recovery codes.',
    'auth.twofa.recovery.toggle': 'login using an authentication code',
    'auth.twofa.recovery.placeholder': 'Enter recovery code',
    'auth.twofa.or': 'or you can ',
} satisfies Record<string, Message>;
