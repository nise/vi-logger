define(['jquery'], function ($) {


    function Daemon(options) {
        this.options = $.extend(this.options, options); // todo: wroite in plain js
        this.video = document.getElementById(this.options.videoSelector);
    }

    Daemon.prototype = {
        name: 'playerDaemon',
        type: 'tool',
        options: {
            videoSelector: 'video1'
        },
        currentRules:'',
        currentRuleIndex:-1,

        rules: function () {
            var r = 'play2,play0.003,pause50,fw20,bw10,speed0.3,volume0,volume100,play,end';
            this.currentRules = r.split(/,/g);

        },

        start: function(){

        },

        pause: function(){

        },

        next: function(){
            if(this.currentRules.length-1 < this.currentRulesIndex){
                this.currentRulesIndex++;
            }
        },

        stop: function(){

        },

        /**
         * Interprets a single rule and execute the command at the player
         */
        interpreteRule: function(rule) {
            var time = parseInt(rule);
            var command = rule.replace(time, '');
            switch (command) {
                case 'play':
                    break;
                case 'pause':
                    break;
                case 'fw':
                    break;
                case 'bw':
                    break;
                case 'speed':
                    break;
                case 'volume':
                    break;
                case 'end':
                    break;
            }
        }
    }

    return Daemon;
});