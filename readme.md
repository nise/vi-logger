Vi-Logger demonstrates how different logging approaches affect the computed watch time of a video. 




**Methods to capture video watching:**
* Segment: The video is split up into segments of equal size. As soon as a segment has been completely played back it is written in the log.
* Heartbeat: Every n seconds a heartbeat is send out to the log. This logging event contains the current playback position.
* Clickstream: Every mouse click event is written to the log and includes the current playback time. 

**Features**

* Implements three logging approaches
* Computes the watching time for each loging approch.