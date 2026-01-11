import jwt from 'jsonwebtoken';

interface TokenPayload {
    userId: string;
}

export const generateToken = (userId: string): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign({ userId }, secret, {
        expiresIn: '24h',
    });
};

export const verifyToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.verify(token, secret) as TokenPayload;
};
