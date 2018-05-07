define(['jquery', 'lib/vi2/vi2.main'], function ($, Vi2) {
    var video_data = {};
    video_data.metadata = [];
    video_data.metadata[0] = {};
    video_data.metadata[0].author = 'Meyer';
    video_data.metadata[0].title = 'Test';
    video_data.metadata[0].abstract = 'bla';
    //video_data.metadata[0].thumbnail = "still-" + video_data.filename.replace('.mp4', '_comp.jpg');
    video_data.video = 'http://download.media.tagesschau.de/video/2017/0605/TV-20170605-0145-1001.websm.h264.mp4';//'/videos/' + video_data.filename.replace('.mp4', '.webm');
    Vi2.start(video_data, 1);

    var eee = function () {
        console.log(window.vi2.observer.getWidget('player-playback-logger').interval());
    }
    setTimeout(eee, 4000);

    var
        print = document.getElementById('print'),
        out = document.getElementById('logoutput'),
        check_segments = document.getElementById('logsegments'),
        check_segments_length = document.getElementById('logseglength'),
        check_heartbeat = document.getElementById('logheartbeat'),
        check_heartbeat_length = document.getElementById('logheartlength'),
        check_clickstream = document.getElementById('logclick'),
        clickstream_tolerance = document.getElementById('clickstreamtolerance')
        heartbeat = check_heartbeat_length.value,
        heart_interval = -1
        ;

    print.addEventListener('click', function () {
        computeWatchTime();
    })

    check_segments.addEventListener('change', function () {
        if (this.checked) {
            // Checkbox is checked..
        } else {
            // Checkbox is not checked..
        }
    });

    check_segments_length.addEventListener('change', function () {
        window.vi2.observer.getWidget('player-playback-logger').interval(Number(this.value));
    });

    check_heartbeat.addEventListener('change', function () {

        if (this.checked) {
            heart_interval = setInterval(writeHeartbeat, heartbeat * 1000);
        } else {
            heart_interval = clearInterval(heart_interval);
        }
    });

    check_heartbeat_length.addEventListener('change', function () {
        heartbeat = this.value;
    });

    function writeHeartbeat() {
        Vi2.Observer.log({
            context: 'player',
            action: 'heartbeat',
            values: [Number(Vi2.Observer.player.currentTime().toFixed(1))]
        });
    }

    /*check_clickstream.addEventListener('change', function () {
        if (this.checked) {
            // Checkbox is checked..
        } else {
            // Checkbox is not checked..
        }
    });*/

    /**
     * Automotatic scrol down after adding a new entry to the texarea
     */
    //out.addEventListener('input selectionchange propertychange', function (e) {
    //  this.scrollTop = this.scrollHeight;
    //})

    function computeWatchTime() {
        var
            log = out.value.split(/\r?\n/),
            res = {}
            ;
        
        for (var i = 0, len = log.length; i < len; i++) {
            var entry = log[i].split(',');
            if (entry[1] === 'playback' || entry[1] === 'heartbeat') {
                res[entry[1]] = res[entry[1]] || [];
                if (entry[2] !== undefined)
                    res[entry[1]].push({ utc: entry[0], event: entry[1], time: entry[2] });
            } else {
                res['clickstream'] = res['clickstream'] || [];
                if (entry[2] !== undefined)
                    res['clickstream'].push({ utc: parseInt(entry[0]), event: 'clickstream', time: parseInt(entry[2]) });
            }
        }

        // by segments
        if (res['playback'] !== undefined) {
            document.getElementById('resultsegment').innerHTML = res['playback'].length * check_segments_length.value;
        }else{
            document.getElementById('resultsegment').innerHTML = 0;
        }

        // by heartbeats
        if (res['heartbeat'] !== undefined) {
            var
                c = 0,
                tmp = res['heartbeat'][0]
                //e = clickstream_tolerance.value
                ;
            for (var i = 1, len = res['heartbeat'].length; i < len; i++) {
                var
                    entry = res['heartbeat'][i],
                    timeDistance = entry.utc - tmp.utc,
                    playbackDistance = (entry.time - tmp.time) * 1000
                    ;
                console.log(timeDistance + ' ' + playbackDistance)
                if (playbackDistance > 0) {
                    //if (timeDistance - playbackDistance <= e) {
                        c += playbackDistance
                    //}
                }
                tmp = entry;
            }
            document.getElementById('resultheartbeat').innerHTML = (c / 1000).toFixed(1);
        }

        // by clickstream
        if (res['clickstream'] !== undefined) {
            var
                c = 0,
                tmp = res['clickstream'][0],
                e = clickstream_tolerance.value
                ;
            for (var i = 1, len = res['clickstream'].length; i < len; i++) {
                var
                    entry = res['clickstream'][i],
                    timeDistance = entry.utc - tmp.utc,
                    playbackDistance = (entry.time - tmp.time) * 1000
                    ;
                if (playbackDistance > 0) {
                    if (timeDistance - playbackDistance <= e) {
                        c += playbackDistance
                    }
                }
                tmp = entry;
            }
            document.getElementById('resultclickstream').innerHTML = (c/1000).toFixed(1);
        }
    }


});