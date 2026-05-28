import passport from "passport";
import { Strategy as GoogleStrategy, type VerifyCallback, type Profile } from "passport-google-oauth20";
import { config, logger } from "@/shared/config";
import { type GoogleProfile } from "@/shared/types/global";



// ─── Strategy ─────────────────────────────────────────────────────────────────

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.clientId,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackUrl,
            scope: ['profile', 'email'],
        },
        async (
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            done: VerifyCallback,
        ): Promise<void> => {
            try {
                const googleProfile: GoogleProfile = {
                    googleId: profile.id,
                    email: profile.emails?.[0].value ?? '',
                    firstName: profile.name?.givenName ?? '',
                    lastName: profile.name?.familyName ?? '',
                    avatar: profile.photos?.[0].value ?? '',
                };

                // Pass profile to the callback route — let the service layer handle
                // user creation / lookup so the strategy stays thin
                done(null, googleProfile);
            } catch (error) {
                logger.error('Google strategy error:', error);
                done(error as Error);
            }
        },
    ),
);

export default passport;