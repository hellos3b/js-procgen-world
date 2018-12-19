define(['world/Tile', 'world/ProceduralGenerator', 'world/MiniMap'], function(Tile, ProceduralGenerator, MiniMap) {
   var _tiles = [],
       _tileMap = {},
       _tileClicks = [],
       _selectedTile,
       _centerTile,
       _centerTileUpdate = true,
       _activeTiles = {},
       _highlightedTiles = [],
       _panAdjust = false,
       _mapwidth = 50,
       _mapheight = 50;
    
    function TileManager(game) {
        var self = this;
        this.game = game;
        
        // tile selector handling
        game.input.onDown.add(this.setDragFalse, this);
        game.input.onUp.add(this.handleClick, this);

        var offset = this.offset = {xValue: 0, yValue: 0};
        Object.defineProperty(offset, "x", {
            get: function() {
                return this.xValue;
            },
            set: function(val) {
                this.xValue = val;
            }
        });
         Object.defineProperty(offset, "y", {
            get: function() {
                return this.yValue;
            },
            set: function(val) {
                if (val != this.yValue) {
                    _centerTileUpdate = true;
                    _panAdjust = true;
                }
                
                this.yValue = val;
            }
        });
        
        this.map = ProceduralGenerator.create();
        this.initTiles();
        
        this.calcWorldBounds();
        MiniMap.init(game, this.map);
        
        this.findCenterTile();
        
        // debug
        var key = game.input.keyboard.addKey(Phaser.Keyboard.A);
        key.onDown.add(function() {
                var x = _selectedTile.x;
                self.centerOnTilePosition(x+1, _selectedTile.y);
            }, this);
    }
    
    TileManager.prototype = {
        
        offcenter: {
            x: 0,
            y: 0
        },
        
        selectedTile: function() {
            return _selectedTile;
        },
        
        centerTile: function() {
            this.findCenterTile();
            return _centerTile;
        },
        
        addTileClick: function(point, tile) {
            _tileClicks.push(tile);
        },
        
        addActiveTile: function(tile) {
            _activeTiles[tile.id] = tile;   
        },
        
        removeActiveTile: function(tile) {
            delete _activeTiles[tile.id];
        },
        
        getOffX: function() {
            return this.offset.x// - this.offcenter.x;
        },
        
        getOffY: function() {
            return this.offset.y// - this.offcenter.y;
        },
        
        scrollToTile: function(tile) {
            var self = this;
            this.scrolltick = 0;
            this.xroll = (this.offset.x - tile.getX() - (this.game.width / 2) + 64) / 5;
            this.yroll = (this.offset.y - tile.getY() - (this.game.width / 2) + 32) / 5;
            this.scroll = setInterval(function() {
                self.offset.x -= self.xroll;
                self.offset.y -= self.yroll;
                self.scrolltick++;
                
                self.updateTiles(tile);
                self.updateActiveTiles();
                self.selectTile(tile.id);

                if (self.scrolltick >= 5) {
                    clearInterval(self.scroll);
                }
            }, 33);
        },
        
        scrollToTilePosition: function(x, y) {
            var tile = this.map.getValueAt(x, y);
            this.scrollToTile(tile);
        },
        
        centerOnTilePosition: function(x, y) {
            var tile = this.map.getValueAt(x, y);
            this.centerOnTile(tile);
        },
        
        centerOnTile: function(tile) {
//            console.log("Old offset", this.offset);
            this.offset.x -= tile.getX() - (this.game.width / 2) + 64;
            this.offset.y -= tile.getY() - (this.game.height / 2) + 32;
//            console.log("New offset", this.offset);
            
            
            this.updateTiles(tile);
            this.updateActiveTiles();
//            this.selectTile(tile.id);
        
        },
        
        calcWorldBounds: function() {
            var tilemap = this.map;
            
            var top = tilemap.getCellAt(0, 0).get().worldY;
            var bottom = tilemap.getCellAt(tilemap.w - 1, tilemap.h - 1).get().worldY + 64;
            var left = tilemap.getCellAt(0, tilemap.h - 1).get().worldX;
            var right = tilemap.getCellAt(tilemap.w - 1, 0).get().worldX + 128;
            
            this.worldBounds = {
                width: right - left,
                height: bottom - top
            };
            
            // Fix top left to be 0,0
            var toptile = tilemap.getCellAt(0,0).get();
            var lefttile = tilemap.getCellAt(0, tilemap.h - 1).get();
            this.offcenter = {
                x: (this.game.width / 2) - lefttile.worldX,
                y: (this.game.height / 2) - toptile.worldY
            };
        },
        
        drag: function(diff) {
            
            this.offset.x -= diff.x * 1.5;
            this.offset.y -= diff.y * 1.5;  

            if (_panAdjust) {

                // active_tile is just a random tile that is somewhere near 
                // user view that'll be used for snaphsot
                var tile_in_view;
                for (var k in _activeTiles) {
                    if (_activeTiles[k]) {
                        tile_in_view = _activeTiles[k];
                    }
                }


                if (!tile_in_view) {
                    tile_in_view = {x:0,y:0};
                }

                this.updateTiles(tile_in_view);
                this.updateActiveTiles();
                MiniMap.moveMiniBox(this.offset);
    //            540, 360
                
                _panAdjust = false;
            }
        },
        
        findCenterTile: function() {
            if (_centerTileUpdate) {
                console.time("Finding center");
                var game = this.game;
                var point = game.add.sprite(game.width/2, game.width/2);
                game.physics.arcade.enable(point);
                point.body.setSize(0,0,1,1);

                // Create a list of tiles that intersect,
                // then findSelectedTile() to figure which one actually was clicked
                var spriteList = this.getActiveTileSprites();

                game.physics.arcade.overlap(point, spriteList, this.addTileClick, null, this);
                var center_id = this.findSelectedTile(point);

                if (center_id) {
                    _centerTile = this.map.getCellByIndex(center_id);
                }
                
                _centerTileUpdate = false;
                console.timeEnd("Finding center");
            }
        },
        
        updateActiveTiles: function() {
             for (var k in _activeTiles) {
                _activeTiles[k].drag();
             }
            
        },
        
        updateTiles: function(center_tile) {
             var SNAPSHOT_RADIUS = 30;
            
            this.map.splice({
                startx: center_tile.x - SNAPSHOT_RADIUS,
                starty: center_tile.y - SNAPSHOT_RADIUS,
                endx: center_tile.x + SNAPSHOT_RADIUS,
                endy: center_tile.y + SNAPSHOT_RADIUS
            }, function(cell, tile) {
                tile.drag();
            });
        },
        
        distanceFrom: function(pointa, pointb) {
            var dx = pointa.x - pointb.x;
            var dy = pointa.y - pointb.y;

            return Math.sqrt(dx * dx + dy * dy);
        },
        
        findSelectedTile: function(point) {
            var selected = null;
            var pointer = {x: point.body.x + 5, y: point.body.y + 5 };
            for (var i = 0; i < _tileClicks.length; i++) {
                var tile_pos = {x: _tileClicks[i].body.x + 64, y: _tileClicks[i].body.y + 32};
                if (!selected) {
                    selected = { distance: this.distanceFrom(tile_pos, pointer), id: _tileClicks[i].tile_id };
                } else {
                    var distance = this.distanceFrom(tile_pos, pointer); 
                    if (distance < selected.distance) {
                        selected = { distance: distance, id: _tileClicks[i].tile_id };
                    }
                }
            }
            
            return selected.id;
        },
        
        getTile: function(id) {
            return _tileMap[id];
        },
        
        getMapWidth: function() {
            return _mapwidth;
        },
        
        getActiveTileSprites: function() {
            var result = [];
            for (var k in _activeTiles) {
                result.push(_activeTiles[k].sprite);
            }
            return result;
        },
        
        handleClick: function(pointer) {
            if (!window._dragging) {
                var game = this.game;

                var point = game.add.sprite(pointer.worldX, pointer.worldY);
                game.physics.arcade.enable(point);
                point.body.setSize(-5,-5,10,10);

                // Create a list of tiles that intersect,
                // then findSelectedTile() to figure which one actually was clicked
                var spriteList = this.getActiveTileSprites();
                
                game.physics.arcade.overlap(point, spriteList, this.addTileClick, null, this);
                var click_id = this.findSelectedTile(point);

                if (click_id) {
                    this.selectTile(click_id);
                } else {
                    console.warn("Unable to find selected tile", point, _tileClicks);
                }
            }
        },
      
        initTiles: function() {
            var game = this.game;
            var self = this;

            this.map.each(function(cell, tileType) {
                var tile = new Tile(game, self);
//                _tiles.push(tile);
                _tileMap[tile.id] = tile;
                
                tile.load(cell, tileType); 
                
                cell.set(tile);
            });
            
            this.size = this.map.size();
        },
        
        selectTile: function(id) {
            if (_selectedTile) {
                _selectedTile.deselect();
            }
            for (var i = 0; i < _highlightedTiles.length; i++) {
                _highlightedTiles[i].deselect();
            }
            
            _highlightedTiles = [];
            _selectedTile = _tileMap[id];
            
            
//            this.map.splice({
//                startx: _selectedTile.x - 2,
//                starty: _selectedTile.y - 2,
//                endx: _selectedTile.x + 2,
//                endy: _selectedTile.y + 2
//            }, function(cell, tile) {
//                tile.highlight();
//                _highlightedTiles.push(tile);
//            });
            _selectedTile.select();
            
            // select neighbors
        },
        
        unDarkenTiles: function(center, radius) {
             this.map.splice({
                startx: center.x - radius,
                starty: center.y - radius,
                endx: center.x + radius,
                endy: center.y + radius
            }, function(cell, tile) {
                tile.undarken();
            });
        },
        
//        this.bgTiles.getGridAt(x,y).set( background.data[y][x] );
        setDragFalse: function() {
            window._dragging = false;   
        },
        
        setEntityAt: function(entity, x, y) {
            this.map.getCellAt(x, y).setEntity(entity);   
        }
    };
    
    return TileManager;
});