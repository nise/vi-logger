Vi-Logger demonstrates how different logging approaches affect the computed watch time of a video. 

See the demo (https://nise.github.io/vi-logger/public/)[https://nise.github.io/vi-logger/public/]

**Methods to capture video watching:**
* Timeupdate: Everytime the html player fires a "timeupdate" event a log entry will be written.
* Segment: The video is split up into segments of equal size. As soon as a segment has been completely played back it is written in the log.
* Heartbeat: Every n seconds a heartbeat event fired and written to the log. This logging event contains the current playback position.
* Clickstream: Every mouse click event is written to the log and includes the current playback time. 

**Features**
* Implements for logging approaches
* Computes the watching time for each capturing approch.


**Roadmap**
* register if tab is active
* register if tab gets closed
* time update computation
* redesign of UI
* Compute combinations of the logging appraoches.
* Define automated playback paths (e.g. "go to 1:22 play 10 sec, go to 1:50 play 20 min")
* Consider browser load and memory usage.
* Consider the playback rate in the computation.
* Document the used algorithms.
* add some visualization (e.g. interaction peaks, forward backward diagram)
* switch to vue.js

