/* 
* name: Vi2.core.player.logger
* author: niels.seidel@nise81.com
* license: MIT License
* description: Logs segments of specified size that the user has been watched.
*/

define(function () {

    var
        vi2 = window.vi2 || {},
        Vi2 = window.Vi2 || {}
        ;
    Vi2.logi = 2;
    function Logger(options) {
        this.options = Object.assign(this.options, options);
    }

    Logger.prototype = {

        options:{},
        log_interval:2, // seconds
        timer: null,
        lastposition: -1,
        video: null,
        name: 'player-playback-logger',

        init: function () {
            if (vi2.observer.name !== 'observer'){
                console.log('No observer available. Player log not possible.');
                return;
            } else if (vi2.observer.player.name !== 'player'){
                console.log('No player available. Player log not possible.');
                return;
            }
            this.video = vi2.observer.player.video;
            this.log_interval = 2;
            this.lastposition = -1;
            this.timer = null;
            Vi2.logi = this.log_interval;
            var _this = this;

            this.video.addEventListener('play', function (e) {
                _this.start();
            });

            this.video.addEventListener('pause', function (e) {
                _this.stop();
            });

            this.video.addEventListener('abort', function (e) {
                _this.stop();
            });

            //this.video.addEventListener('timeupdate', function (e) {
                //_this.start();
            //});

            this.video.addEventListener('ended', function (e) { 
                _this.stop();
            }, false);

            /*
            player.oncanplay(start);
            player.onSeek(restart);
            player.onPause(stop);
            player.onBuffer(stop);
            player.onIdle(stop);
            player.onComplete(stop);
            player.onError(stop);
           */
        },

        /**
         * Getter/Setter of logging interval length
         */
        interval: function(i){
            if(i !== undefined && typeof(i) === 'number'){
                this.log_interval = i;
                Vi2.logi = i;
                this.stop();
                this.restart();
            }else {
                return this.log_interval;
            }
        },

        loop: function () { 
            var log_interval = Vi2.logi;//Observer.widget_list['player-logger'].log_interval;
            var curr = vi2.observer.player.currentTime();
            var currentinterval = curr > 0 ? Math.round( curr / log_interval ) : 0;
            //console.log(currentinterval + '----' + curr + ' ...........' + (curr / log_interval) + '++++' + this.log_interval)
            if (currentinterval != this.lastposition) {
                vi2.observer.log({ context: 'player', action: 'playback', values: [currentinterval] });
                this.lastposition = currentinterval;
            }
        },

        start: function () { 
            if (this.timer) {
                this.timer = clearInterval(this.timer);
            }
            this.timer = setInterval(this.loop, this.log_interval * 1000);
            setTimeout(this.loop, 100);
        },

        restart: function () {
            if (this.timer) {
                this.timer = clearInterval(this.timer);
            }
            this.lastposition = -1;
            this.timer = setInterval(this.loop, this.log_interval * 1000);
            setTimeout(this.loop, 100);
        },

        stop: function () {
            this.timer = clearInterval(this.timer);
        }

    };

    return Logger;
});