define(['ref/Groups', 'entities/nature/Tree', 'world/TileProperties'], function(Groups, TreeEntity, TileProperties) {
    var ids = 0;
    
    var init_offset_x = 540 - 64;
    /* Tile.js */
    function Tile(game, manager) {
        var self = this;
        this.id = ids++;
        this.game = game;
        this.manager = manager;
        this.sprite = null;
        this.selected = false;
        this.highlighted = false;
        this.entity = null;
        this.active = false;
        this.properties = new TileProperties(this);
    }
     
    Tile.prototype = {
        
        addSprite: function() {
            var sprite = this.sprite = this.game.add.sprite(this.getX(), this.getY(), "environment");
            Groups.tilemap.add(sprite);

            this.game.physics.arcade.enable(sprite);
            sprite.frame = this.type;
            sprite.tile_id = this.id;

            if (this.entity) {
                this.entity.addSprite();
            }

            this.manager.addActiveTile(this);

            if (this.highlighted)
                this.highlight();
            if (this.selected)
                this.select();
            
            if (this.getProperty("dark")) {
                this.sprite.alpha = 0;
                if (this.entity) {
                    if (this.entity.sprite) {
                        this.entity.sprite.alpha = 0;
                    }
                }
            }
        },
        
        getX: function() {
            return this.worldX + this.manager.getOffX();
        },
        
        getY: function() {
            return this.worldY + this.manager.getOffY();
        },
        
        deselect: function() {
            if (this.sprite)
                this.sprite.tint = "0xffffff";  
            
            this.selected = false;
            this.highlighted = false;
        },
        
        drag: function() {
            if (this.sprite) {
                this.sprite.body.x = this.getX();
                this.sprite.body.y = this.getY();
            }
             if (this.entity) {
                this.entity.updatePosition(this.getX(), this.getY());
//                this.tilesprite.body.x = this.getX();
//                this.tilesprite.body.y = this.getY() - 64;
            }
            
            this.checkRender();
        },
        
        load: function(grid, tileType) {
            this.type = tileType;
            this.grid = grid;
        
            this.x = grid.x;
            this.y = grid.y;
            
            this.offX = (this.x - this.y) * 64 + init_offset_x;
            this.offY = (this.x + this.y) * 32;
            
            this.worldX = this.offX;
            this.worldY = this.offY;
            
            if (this.type == 3) {
                this.setEntity(new TreeEntity(this.game));
            }
            
            this.checkRender();
        },
        
        getProperty: function(key) {
            return this.properties.get(key);  
        },
        
        checkRender: function() {
            var worldX = this.worldX + this.manager.getOffX();
            var worldY = this.worldY + this.manager.getOffY();
            
            if (worldX > -300 && worldX < 1380 && worldY > -300 && worldY < 1080) {
                if (!this.sprite) {
                    this.addSprite();
                }
            } else if (this.sprite) {
                this.removeSprite();
            }
        },
        
        findNeighbors: function() {
            var mapWidth = this.parent.getMapWidth();
            
        },
        
        highlight: function() {
            if (this.sprite) {
                this.sprite.tint = "0xffccff"; 
            }
            this.highlighted = true;
        },
        
        removeSprite: function() {
            this.sprite.kill();
            if (this.sprite.group) {
               this.sprite.group.remove(this.sprite);
            } else if (this.sprite.parent) {
               this.sprite.parent.removeChild(this.sprite);
            }
            
            if (this.entity) {
                this.entity.destroy();
            }
            
            this.sprite = null;
            
            this.manager.removeActiveTile(this);
        },
        
        select: function() {
            if (this.sprite) {
                this.sprite.tint = "0x00ffaa";
            }
            this.selected = true;
        },
        
        undarken: function() {
            this.properties.set("dark", false); 
            
            if (this.sprite)
                this.sprite.alpha = 1;
            
             if (this.entity) {
                if (this.entity.sprite)
                    this.entity.sprite.alpha = 1;
             }
            
            this.checkRender();
        },
        
        setEntity: function(entity) {
            this.entity = entity;
            entity.init(this);
            
            if (entity.getProperty("player")) {
                this.manager.unDarkenTiles(this, entity.getProperty("ViewRadius"));
            }
        }

    };
       
    return Tile;
});