import { describe, expect, it } from 'vitest';
import { Pool } from './Pool';

class Pooled {
    available = false;
    resets = 0;
    reset() {
        this.resets++;
    }
}

describe('Pool', () => {
    it('builds new objects while none are available', () => {
        let built = 0;
        const pool = new Pool(() => {
            built++;
            return new Pooled();
        });
        const first = pool.acquire();
        const second = pool.acquire();
        expect(first).not.toBe(second);
        expect(built).toBe(2);
        expect(pool.getSize()).toBe(2);
    });

    it('reuses released objects and resets them', () => {
        const pool = new Pool(() => new Pooled());
        const first = pool.acquire();
        pool.acquire();
        first.available = true;
        const reused = pool.acquire();
        expect(reused).toBe(first);
        expect(reused.available).toBe(false);
        expect(reused.resets).toBe(2);
        expect(pool.getSize()).toBe(2);
    });

    it('hands out prepopulated objects before building more', () => {
        let built = 0;
        const pool = new Pool(() => {
            built++;
            return new Pooled();
        }, 3);
        pool.acquire();
        pool.acquire();
        pool.acquire();
        expect(built).toBe(3);
    });
});
