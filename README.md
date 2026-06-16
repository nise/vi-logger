Vi-Logger demonstrates how different logging approaches affect the computed watch time of a video.

See the demo at [https://nise.github.io/vi-logger/](https://nise.github.io/vi-logger/)

## Capturing approaches

Four independent methods capture playback activity and write timestamped log entries:

- **Timeupdate** — the HTML5 video element fires a `timeupdate` event roughly every 250 ms during playback. Each event is written to the log with the current UTC timestamp and playback position.
- **Segment** — the video is divided into fixed-length segments (default: 5 s). As soon as a segment has been played through completely, one log entry is written.
- **Heartbeat** — a timer fires every N seconds (default: 30 s) and writes the current playback position to the log, regardless of whether the video is playing or paused.
- **Clickstream** — every mouse click on the page writes the current playback position and UTC timestamp to the log.

## Approaches to compute watching time

All four algorithms work on the same CSV log and compute an independent estimate of how much of the video was actually watched.

### Timeupdate

Consecutive `timeupdate` log entries are compared in pairs. For each pair:

- `timeDistance` = wall-clock difference between the two entries (ms)
- `playbackDistance` = difference in playback position × 1000 (ms)

A pair counts as watched if:
1. `playbackDistance > 0` (video moved forward)
2. `playbackDistance − timeDistance ≤ ε` where ε is the configured tolerance (default: 1000 ms)

Condition 2 rejects seeks: a large jump in playback position relative to elapsed wall time indicates the user scrubbed rather than watched continuously. Accumulated `playbackDistance` values give the total watched time in milliseconds.

### Segment

Each `playback` log entry represents one fully-played segment. Watch time is simply:

```
watchTime = numberOfSegmentEntries × segmentLength
```

This approach over-counts if the user replays the same segment and under-counts if they skip out of a segment before it completes.

### Heartbeat

Consecutive `heartbeat` entries are compared in pairs:

- `playbackDistance` = difference in playback position × 1000 (ms)

A pair contributes `playbackDistance` to the total if `playbackDistance > 0`. No tolerance filter is applied — at a 30 s interval, normal playback always produces a positive distance, while pausing produces zero. Seeks are not filtered out.

### Clickstream

Consecutive click entries are compared in pairs using the same formula as timeupdate (wall-clock distance vs. playback distance with tolerance ε). The lower event frequency makes it a coarser estimate than timeupdate, but it captures user interaction points rather than constant polling.

## Features

- Four independent logging approaches selectable at runtime
- Per-approach watch time computed live in the browser

## Roadmap

- add some visualization (e.g. interaction peaks, forward/backward diagram)
- consider the playback rate in the computation
- compute combinations of logging approaches
- detect local vs. remote execution for loading the video
- register if tab is active or if it gets closed
- define automated playback paths (e.g. "go to 1:22, play 10 s, go to 1:50, play 20 min")
- consider browser load and memory usage

# Contributors

Niels Seidel <niels.seidel@fernuni-hagen.de>


