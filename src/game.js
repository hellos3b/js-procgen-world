define([
    'phaser',
    'debug',
    'world/TileManager',
    'world/MiniMap',
    'ref/Groups',
    'entities/units/Worker',
    'entities/structures/Tent'
], function (Phaser, Debugger, TileManager, MiniMap, Groups, WorkerEntity, TentEntity) { 
    'use strict';
    
    var game,
        old_pointer;
    
    function _dragStart() {
        window._dragging = true;
    }
    function _dragStop() {
        window._dragging = false;
    }
   
    function Game() {    
        console.log('Making the Game'); 
    }
    
    Game.prototype = {
    	constructor: Game,
        
        start: function() {
            game = new Phaser.Game(1080, 720, Phaser.CANVAS, '', { 
                preload: this.preload, 
                create: this.create,
                update: this.update,
                render: this.render
            });
        },
        
        preload: function() {
            game.stage.backgroundColor = '#333333';
            game.load.spritesheet('environment', 'assets/img/world/environment.png', 128, 64, 12);
            game.load.spritesheet('minimap', 'assets/img/world/minimap.png', 2, 2, 4);
            game.load.spritesheet('nature', 'assets/img/world/nature.png', 128, 128, 3);
            game.load.spritesheet('units', 'assets/img/world/units.png', 128, 128, 3);
            game.load.spritesheet('structures1', 'assets/img/world/structures_1x1.png', 128, 128, 3);
            
//            AudioManager.preload(game);
//            World.preload(game);
        },
        
        create: function() {
            game.world.setBounds(0, 0, 1080, 720);
            
            // Stretch to fill
//            game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
//            
//            PathFinder.init(game);
//            Groups.init(game);
//            State.initWorld(game, "wild_2_1");
////            
            
            Groups.init(game);
            var tileManager = this.tileManager =  new TileManager(game);
            window.tileManager = tileManager;
            game.add.plugin(Debugger);
            
            // debug
            tileManager.map.getValueAt(100, 60)
                .setEntity(new WorkerEntity(game, {player: true}));
            tileManager.map.getValueAt(100, 59)
                .setEntity(new TentEntity(game, {player: true}));
            tileManager.centerOnTilePosition(100, 59);
        },
        
        update: function() {
            
//            window.game = game;
            this.tileManager.drag({x:0,y:0});
            
            /* Camera drag */
            if (this.game.input.activePointer.isDown) {
                if (this.game.origDragPoint) {
                    // move the camera by the amount the mouse has moved since last update
                    var movex = this.game.origDragPoint.x - this.game.input.activePointer.position.x;
                    var movey = this.game.origDragPoint.y - this.game.input.activePointer.position.y;
                    this.tileManager.drag({
                        x: movex,
                        y: movey
                    });
                    
//                    this.game.camera.x += (this.game.origDragPoint.x - this.game.input.activePointer.position.x) * 1.5;
//                    this.game.camera.y += (this.game.origDragPoint.y - this.game.input.activePointer.position.y) * 1.5;
                    
                    // if person moves more than 2 pixels, we're dragging
                    if (Math.abs(this.game.origDragPoint.x - this.game.input.activePointer.position.x) > 2 || Math.abs(this.game.origDragPoint.y - this.game.input.activePointer.position.y) > 2) {
                        window._dragging = true;
                    }
                }
                // set new drag origin to current position
                this.game.origDragPoint = this.game.input.activePointer.position.clone();
            } else {
                this.game.origDragPoint = null;
            }
            
            
            Groups.isometric.sort('y', Phaser.Group.SORT_ASCENDING);
        },
        
        render: function() {
            // debug text
//            MiniMap.draw();
            game.debug.text( "WORLD TILES: "+this.tileManager.size, 850, 70 );
            game.debug.text( "RENDERED TILES: "+Groups.tilemap.length, 850, 90 );
            
            if (this.tileManager.selectedTile()) {
                var x = this.tileManager.selectedTile().x;
                var y = this.tileManager.selectedTile().y;
                game.debug.text( "SELECTED: "+x+","+y, 850, 110 );  
            }
            if (this.tileManager.centerTile()) {
                var x = this.tileManager.centerTile().x;
                var y = this.tileManager.centerTile().y;
                game.debug.text( "CENTER: "+x+","+y, 850, 130 ); 
            }
//            game.debug.text( "WORLD SIZE: ("+game.world.bounds.x+","+game.world.bounds.y+") "+game.world.bounds.width+"x"+game.world.bounds.height, 60, 100 );
//            
            
//            game.debug.text( World.getCurrentName(), 525, 60 );
        },
        
        getGame: function() { return game; }
    };
    
    
    
    return Game;
});