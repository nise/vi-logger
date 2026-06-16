define(["jquery", "lib/vi2/vi2.main"], function ($, Vi2) {
  var video_data = {};
  video_data.metadata = [];
  video_data.metadata[0] = {};
  video_data.metadata[0].author = "Meyer";
  video_data.metadata[0].title = "Test";
  video_data.metadata[0].abstract = "bla";
  //video_data.metadata[0].thumbnail = "still-" + video_data.filename.replace('.mp4', '_comp.jpg');
  video_data.video =
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_2MB.mp4";
  //video_data.video = 'http://localhost/videos/VIDEO03_1_Biathlon2_Biathlon_Instruktion.mp4';
  Vi2.start(video_data, 1);

  var out = document.getElementById("logoutput"),
    timeupdate_check = document.getElementById("timeupdatelog"),
    check_segments = document.getElementById("logsegments"),
    check_segments_length = document.getElementById("logseglength"),
    check_heartbeat = document.getElementById("logheartbeat"),
    check_heartbeat_length = document.getElementById("logheartlength"),
    check_clickstream = document.getElementById("logclickstream"),
    clickstream_tolerance = document.getElementById("clickstreamtolerance"),
    heartbeat = check_heartbeat_length.value,
    heart_interval = -1;
  var chart = new Chart(document.getElementById("watchingTimeChart"), {
    type: "line",
    data: {
      datasets: [
        {
          label: "Timeupdate",
          data: [],
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "transparent",
          tension: 0.1,
          pointRadius: 0,
          parsing: false,
        },
        {
          label: "Segment",
          data: [],
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "transparent",
          tension: 0.1,
          pointRadius: 5,
          parsing: false,
        },
        {
          label: "Heartbeat",
          data: [],
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "transparent",
          tension: 0.1,
          pointRadius: 6,
          parsing: false,
        },
        {
          label: "Clickstream",
          data: [],
          borderColor: "rgb(255, 159, 64)",
          backgroundColor: "transparent",
          tension: 0.1,
          pointRadius: 6,
          parsing: false,
        },
      ],
    },
    options: {
      animation: false,
      scales: {
        x: {
          type: "linear",
          title: { display: true, text: "Playback position (s)" },
        },
        y: {
          type: "linear",
          min: 0,
          title: { display: true, text: "Watching time (s)" },
        },
      },
    },
  });

  document.getElementById("resetLog").addEventListener("click", function () {
    out.value = "";
    chart.data.datasets.forEach(function (ds) {
      ds.data = [];
    });
    chart.update("none");
    ["resulttimeupdate", "resultsegment", "resultheartbeat", "resultclickstream"].forEach(function (id) {
      document.getElementById(id).innerHTML = "0";
    });
  });

  var compute_interval = 0;
  compute_interval = clearInterval(compute_interval);
  compute_interval = setInterval(computeWatchTime, 1000);

  /**
   * Capture timeupdate events
   */
  timeupdate_check.addEventListener("change", function () {
    if (this.checked) {
      Vi2.Observer.player.video.addEventListener(
        "timeupdate",
        writeTimeupdate,
        false,
      );
    } else {
      Vi2.Observer.player.video.removeEventListener(
        "timeupdate",
        writeTimeupdate,
        false,
      );
    }
  });

  function writeTimeupdate() {
    Vi2.Observer.log({
      context: "player",
      action: "timeupdate",
      values: [Number(Vi2.Observer.player.currentTime().toFixed(1))],
    });
  }

  /**
   * Capture segments
   */
  check_segments.addEventListener("change", function () {
    if (this.checked) {
      // Checkbox is checked..
    } else {
      // Checkbox is not checked..
    }
  });

  check_segments_length.addEventListener("change", function () {
    window.vi2.observer
      .getWidget("player-playback-logger")
      .interval(Number(this.value));
  });

  /**
   * Capture heartbeats
   */
  check_heartbeat.addEventListener("change", function () {
    if (this.checked) {
      heart_interval = setInterval(writeHeartbeat, heartbeat * 1000);
    } else {
      heart_interval = clearInterval(heart_interval);
    }
  });

  check_heartbeat_length.addEventListener("change", function () {
    heartbeat = this.value;
    heart_interval = clearInterval(heart_interval);
    if (check_heartbeat.checked) {
      heart_interval = setInterval(writeHeartbeat, heartbeat * 1000);
    }
  });

  function writeHeartbeat() {
    Vi2.Observer.log({
      context: "player",
      action: "heartbeat",
      values: [Number(Vi2.Observer.player.currentTime().toFixed(1))],
    });
  }

  check_clickstream.addEventListener("change", function () {
    if (this.checked) {
      document.addEventListener("click", writeClickstream);
    } else {
      document.removeEventListener("click", writeClickstream);
    }
  });

  function writeClickstream() {
    Vi2.Observer.log({
      context: "player",
      action: "clickstream",
      values: [Number(Vi2.Observer.player.currentTime().toFixed(2))],
    });
  }

  /**
   * Automotatic scrol down after adding a new entry to the texarea
   */
  //out.addEventListener('input selectionchange propertychange', function (e) {
  //  this.scrollTop = this.scrollHeight;
  //})

  // leave tab
  var interval_id;
  $(window).focus(function () {
    console.log("focus returned to window");
    //if (!interval_id)
    //interval_id = setInterval(hard_work, 1000);
  });

  $(window).blur(function () {
    console.log("blur..leaves the window");
    //clearInterval(interval_id);
    interval_id = 0;
  });

  /**
   * Compute watching time using different measurements and update the chart.
   */
  function computeWatchTime() {
    var log = out.value.split(/\r?\n/),
      res = {};
    for (var i = 0, len = log.length; i < len; i++) {
      var entry = log[i].split(",");
      if (entry[1] === "playback" || entry[1] === "heartbeat" || entry[1] === "timeupdate") {
        res[entry[1]] = res[entry[1]] || [];
        if (entry[2] !== undefined)
          res[entry[1]].push({ utc: entry[0], event: entry[1], time: entry[2] });
      } else if (entry[1] === "clickstream") {
        res["clickstream"] = res["clickstream"] || [];
        if (entry[2] !== undefined)
          res["clickstream"].push({ utc: parseInt(entry[0]), event: "clickstream", time: parseFloat(entry[2]) });
      }
    }

    var timeupdateData = [], segmentData = [], heartbeatData = [], clickstreamData = [];

    // timeupdate
    if (res["timeupdate"] !== undefined) {
      var epsilon2 = Number(clickstream_tolerance.value),
        timeupdate_watching_time = 0,
        tmp = res["timeupdate"][0];
      timeupdateData.push({ x: parseFloat(tmp.time), y: 0 });
      for (var i = 1, len = res["timeupdate"].length; i < len; i++) {
        var entry = res["timeupdate"][i],
          timeDistance = entry.utc - tmp.utc,
          playbackDistance = (entry.time - tmp.time) * 1000;
        if (playbackDistance > 0 && playbackDistance - timeDistance <= epsilon2)
          timeupdate_watching_time += playbackDistance;
        timeupdateData.push({ x: parseFloat(entry.time), y: timeupdate_watching_time / 1000 });
        tmp = entry;
      }
      document.getElementById("resulttimeupdate").innerHTML = (timeupdate_watching_time / 1000).toFixed(1);
    }

    // segments
    if (res["playback"] !== undefined) {
      var segLen = parseFloat(check_segments_length.value), cumSeg = 0;
      for (var i = 0; i < res["playback"].length; i++) {
        cumSeg += segLen;
        segmentData.push({ x: parseFloat(res["playback"][i].time), y: cumSeg });
      }
      document.getElementById("resultsegment").innerHTML = cumSeg;
    } else {
      document.getElementById("resultsegment").innerHTML = 0;
    }

    // heartbeat
    if (res["heartbeat"] !== undefined) {
      var heartbeat_watching_time = 0, tmp = res["heartbeat"][0];
      heartbeatData.push({ x: parseFloat(tmp.time), y: 0 });
      for (var i = 1, len = res["heartbeat"].length; i < len; i++) {
        var entry = res["heartbeat"][i],
          playbackDistance = (entry.time - tmp.time) * 1000;
        if (playbackDistance > 0) heartbeat_watching_time += playbackDistance;
        heartbeatData.push({ x: parseFloat(entry.time), y: heartbeat_watching_time / 1000 });
        tmp = entry;
      }
      document.getElementById("resultheartbeat").innerHTML = (heartbeat_watching_time / 1000).toFixed(1);
    }

    // clickstream
    if (res["clickstream"] !== undefined) {
      var clickstream_watching_time = 0, tmp = res["clickstream"][0],
        epsilon = Number(clickstream_tolerance.value);
      clickstreamData.push({ x: tmp.time, y: 0 });
      for (var i = 1, len = res["clickstream"].length; i < len; i++) {
        var entry = res["clickstream"][i],
          timeDistance = entry.utc - tmp.utc,
          playbackDistance = (entry.time - tmp.time) * 1000;
        if (playbackDistance > 0 && playbackDistance - timeDistance <= epsilon)
          clickstream_watching_time += playbackDistance;
        clickstreamData.push({ x: entry.time, y: clickstream_watching_time / 1000 });
        tmp = entry;
      }
      document.getElementById("resultclickstream").innerHTML = (clickstream_watching_time / 1000).toFixed(1);
    }

    chart.data.datasets[0].data = timeupdateData;
    chart.data.datasets[1].data = segmentData;
    chart.data.datasets[2].data = heartbeatData;
    chart.data.datasets[3].data = clickstreamData;
    chart.update("none");
  }
});
