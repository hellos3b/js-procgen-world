define([], function() {
    var _mapGrid,
        _minimapGroup,
        _minibox,
        _mapColors = { // VALUES taken from minimap.pyxel
            // GRASS
            0: {
                1: 162,
                2: 193,
                3: 77
            },
            // COAST
            1: {
                1: 77,
                2: 72,
                3: 13
            },
            // WATER
            2: {
                1: 90,
                2: 156,
                3: 195
            },
            // FOREST
            3: {
                1: 109,
                2: 148,
                3: 82
            },
            // SAND
            4: {
                1: 191,
                2: 190,
                3: 163
            }
        };
    
    return {
        
        x: 25,
        y: 25,
        minimap: null,
      
        init: function(game, mapGrid) {
            var self = this;
            this.game = game;
            _mapGrid = mapGrid;
            
            _minimapGroup = game.add.group();
            _minimapGroup.fixedToCamera = true;
 
            console.time("generate minimap");
            
            var bmd = this.createImage();
            console.timeEnd("generate minimap");
            
            console.time("add minimap");
            
            this.addMap(bmd);
            
            console.timeEnd("add minimap");
        },
        
        addMap: function(bmd) {
//            this.mapBorder();
            
            // there is NO reasoning behind the y value. just guessed
            this.minimap = this.game.add.sprite(240, 720-240, bmd);
            this.minimap.anchor.setTo(0.5, 0.5);
//            this.minimap.angle = 45;
            
//            _minimapGroup.add(this.minimap);
//            _minimapGroup.scale.x = .65;
//            _minimapGroup.scale.y = .4;
            
//            this.createMiniBox();
        },
        
        mapBorder: function() {
            var drawnObject;
            var game = this.game;
            var width = 480; // example;
            var height = 480; // example;
            var bmd = game.add.bitmapData(width, height);

            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, width, height);
            bmd.ctx.fillStyle = '#000000';
            bmd.ctx.fill();
            
            // there is NO reasoning behind the y value. just guessed
            drawnObject = game.add.sprite(240, 1080 * 1.6 - (160), bmd);
            drawnObject.anchor.setTo(0.5, 0.5);
            
            window.box= drawnObject;
            
             this.mapcontainer = drawnObject;
            _minimapGroup.add(drawnObject);
        },
        
         createMiniBox: function() {
            var drawnObject;
            var game = this.game;
            var width = 10 // example;
            var height = 5 // example;
            var bmd = game.add.bitmapData(width, height);

            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, width, height);
            bmd.ctx.strokeStyle = '#ffffff';
            bmd.ctx.lineWidth="2";
            bmd.ctx.stroke();
            
             var x = this.mapBounds.x + (this.mapBounds.w / 2);
             var y = this.mapBounds.y;
            drawnObject = game.add.sprite( x, y, bmd);
            drawnObject.anchor.setTo(0.5, 0);
            this.game.physics.arcade.enable(drawnObject);
             
             _minibox = drawnObject;
             window.marker = _minibox;
        },
        
        moveMiniBox: function(offset) {
//            
//            _minibox.body.x = this.mapBounds.x + (this.mapBounds.w / 2) - 5 - (offset.x * this.mapBounds.scalex);
//            _minibox.body.y = this.mapBounds.y - (offset.y * this.mapBounds.scaley);
        },
        
        createImage: function() {
            var bmd = this.game.make.bitmapData( _mapGrid.w, _mapGrid.h );
            
            var i = 0;
            var flatmap = _mapGrid.getAllValues();
            
            var tiles = 0;
            bmd.processPixelRGB(function(pixel) {
                var tile = flatmap[i];
                var color = _mapColors[ tile.type ];
                
                pixel.r = color[1];
                pixel.g = color[2];
                pixel.b = color[3];
                pixel.a = 255;
                
                i++;

                return pixel;
            }, this); 
            
            console.log(bmd);
//            var t = bmd.getTransform();
//            bmd.setTransform(bmd.context, t.translateX, t.translateY, t.sx, t.sy, t.skewX, t.skewY);
            return bmd;
        }
        
    };
});