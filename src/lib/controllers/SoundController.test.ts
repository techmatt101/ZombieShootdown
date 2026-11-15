import { describe, expect, it, vi } from 'vitest';
import { Sound, SoundController } from './SoundController';

function fakeClip() {
    const clip = {
        paused: true,
        play: vi.fn(async () => {
            clip.paused = false;
        }),
        pause: vi.fn(() => {
            clip.paused = true;
        }),
    };
    return clip;
}

describe('SoundController', () => {
    it('plays loaded clips only when sound is enabled', () => {
        const enabledClip = fakeClip(), mutedClip = fakeClip();
        const enabled = new SoundController(true), muted = new SoundController(false);
        enabled.load(Sound.AMBIENT, enabledClip as unknown as HTMLAudioElement);
        muted.load(Sound.AMBIENT, mutedClip as unknown as HTMLAudioElement);
        enabled.play(Sound.AMBIENT);
        muted.play(Sound.AMBIENT);
        expect(enabledClip.play).toHaveBeenCalledOnce();
        expect(mutedClip.play).not.toHaveBeenCalled();
    });

    it('resumes exactly the clips that were playing when paused', async () => {
        const clip = fakeClip();
        const sound = new SoundController(true);
        sound.load(Sound.AMBIENT, clip as unknown as HTMLAudioElement);
        sound.play(Sound.AMBIENT);
        await Promise.resolve();
        sound.pauseAll();
        expect(clip.paused).toBe(true);
        sound.resumeAll();
        expect(clip.play).toHaveBeenCalledTimes(2);
        sound.pauseAll();
        sound.pauseAll();
        sound.resumeAll();
        expect(clip.play).toHaveBeenCalledTimes(2);
    });

    it('survives the browser blocking playback', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const clip = { ...fakeClip(), play: vi.fn(async () => Promise.reject(new Error('blocked'))) };
        const sound = new SoundController(true);
        sound.load(Sound.AMBIENT, clip as unknown as HTMLAudioElement);
        sound.play(Sound.AMBIENT);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});
