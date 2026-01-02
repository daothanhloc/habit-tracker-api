import { Type, Static } from '@sinclair/typebox';

// User schema for responses (without password)
export const UserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.Optional(Type.String()),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

export type User = Static<typeof UserSchema>;

// Signup schema - user registration
export const SignupSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8, maxLength: 72 }),
  name: Type.Optional(Type.String()),
});

export type SignupDto = Static<typeof SignupSchema>;

// Login schema - user authentication
export const LoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8, maxLength: 72 }),
});

export type LoginDto = Static<typeof LoginSchema>;

// Refresh token request schema
export const RefreshTokenSchema = Type.Object({
  refreshToken: Type.String(),
});

export type RefreshTokenDto = Static<typeof RefreshTokenSchema>;

// Logout request schema
export const LogoutSchema = Type.Object({
  refreshToken: Type.String(),
});

export type LogoutDto = Static<typeof LogoutSchema>;

// Auth response schema - returned after login/signup
export const AuthResponseSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  user: UserSchema,
});

export type AuthResponse = Static<typeof AuthResponseSchema>;

// Token refresh response schema
export const TokenRefreshResponseSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
});

export type TokenRefreshResponse = Static<typeof TokenRefreshResponseSchema>;
