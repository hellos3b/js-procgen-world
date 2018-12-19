define(['ref/Groups', 'entities/EntityProperties'], function(Groups, EntityProperties) {
    
    function TreeEntity(game, opt) {
        this.game = game;
        
        this.properties = new EntityProperties(this);
        
        opt = opt || {};
        if (opt.player)
            this.properties.set("player", true);
        
        
        this.properties.set("ViewRadius", 5);
    }
    
    TreeEntity.prototype = {
        
        init: function(cell) {
            this.cell = cell;   
        },
        
        addSprite: function() {
            if (!this.sprite) {
                this.sprite = this.game.add.sprite(this.cell.getX(), this.cell.getY() - 64, "units");
                this.game.physics.arcade.enable(this.sprite);
                this.sprite.anchor.setTo(0, 0.5);
                
                Groups.isometric.add(this.sprite);
            }
        },
        
        destroy: function() {
            if (this.sprite) {
                this.sprite.kill();
                if (this.sprite.group) {
                   this.sprite.group.remove(this.sprite);
                } else if (this.sprite.parent) {
                   this.sprite.parent.removeChild(this.sprite);
                }
                
                this.sprite = null;
            }
        },
        
        getProperty: function(prop) {
            return this.properties.get(prop);
        },
        
        updatePosition: function(x, y) {
            if (this.sprite) {
                this.sprite.body.x = x;
                this.sprite.body.y = y - 64;
            }
        }
    };
    
    return TreeEntity;
});