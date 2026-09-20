# Sound sources

All six sound pages were inspected on 2026-09-20 and explicitly identify the sound as **Creative Commons 0 (CC0)**. CC0 permits copying, adaptation and redistribution, including the sample files in this public repository. [CC0 1.0 terms](https://creativecommons.org/publicdomain/zero/1.0/).

Files are Freesound's publicly served high-quality MP3 preview encodings, downloaded from each sound page's actual player URL (not the login-only original download). Exact URLs are in `public/audio/manifest.json`, SHA-256 checksums in `docs/audio-hashes.json`. No account, API key or remote audio request is required at runtime.

| Local file | Creator | Source | Use / runtime modifications |
|---|---|---|---|
| metal.mp3 | alegemaate / Allan Legemaate | [Metal Hit](https://freesound.org/people/alegemaate/sounds/364706/) | Main Craft: short metallic strikes, repeated rhythmic events, fixed gain, stereo positioning |
| light-metal.mp3 | freemaster2 | [metalhit.wav](https://freesound.org/people/freemaster2/sounds/117538/) | Soft Craft and Market: light irregular taps / pulse, fixed gain |
| marimba.mp3 | sgossner / Versilian Studios; performer Justin B. Belanger | [Marimba – B3](https://freesound.org/people/sgossner/sounds/373577/) | Soft Craft: individual notes, playback-rate transposition from MIDI 59, envelope |
| crowd.mp3 | JackAmadon | [Crowd Ambience.wav](https://freesound.org/people/JackAmadon/sounds/486354/) | Market: short overlapping excerpts, envelope and fixed gain |
| bell.mp3 | RP1312 | [2016.07.22 Bell Single 01.wav](https://freesound.org/people/RP1312/sounds/350616/) | Respect: sparse bell notes, envelope; original procedural sine tones provide sustained atmosphere |
| pluck.mp3 | Skamos66 | [C4.wav](https://freesound.org/people/Skamos66/sounds/399494/) | Culture: single plucked note transposed from MIDI 60 into an original pentatonic sequence |

The downloaded MP3 files are unmodified. At decode time the engine removes leading silence and applies a fixed per-sample peak normalization. Processing listed above happens only during playback. No premade music track is used.

These are generic sonic materials, **not field recordings made in Wua-lai**. Culture is a folk-inspired generative pentatonic melody, not a claim to reproduce an authentic Lanna performance or instrument. That interpretation follows the workbook's explicit “เครื่องดนตรีล้านนา/folk-inspired melody” alternative.

Freesound's description of each listed sound allows use without attribution; attribution is nevertheless retained here. No rights to the supplied UI or workbook are inferred from these audio licenses.
