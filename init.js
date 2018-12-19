(function () {
    'use strict';

    requirejs.config({
        baseUrl: "/src/",

        paths: {
        	phaser:   '/libs/phaser',
            easystar: '/libs/phaser_pathfinding-0.2.0.min',
            debug: '/libs/phaser-debug'
        },

        shim: {
        	'phaser': {
        		exports: 'Phaser'
        	},
            'easystar': {
                deps: ['phaser']
            },
            'debug': {
                deps: ['phaser']
            }
        }
    });
    require(['phaser', 'game', 'easystar' ], function (Phaser, Game, EasyStar) {
		var game = new Game();
		game.start();
    });
}());