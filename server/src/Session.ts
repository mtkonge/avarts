import { err, ok, Result } from "@avarts/shared";

export type Session = {
    userId: number;
    token: string;
};

export class Sessions {
    private sessions: Session[] = [];

    constructor() {
    }

    private newSessionToken(): string {
        return crypto.randomUUID();
    }

    addSession(userId: number) {
        const token = this.newSessionToken();
        this.sessions.push({
            userId,
            token,
        });
        return token;
    }

    removeSession(userId: number) {
        this.sessions = this.sessions.filter((session) => {
            return session.userId !== userId;
        });
    }

    userIdFromToken(token: string): Result<number, void> {
        const sessionFound = this.sessions.find((session) => {
            return session.token === token;
        });
        if (!sessionFound) {
            return err();
        }
        return ok(sessionFound.userId);
    }
}
