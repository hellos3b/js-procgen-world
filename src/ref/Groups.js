define([], function() {
    
    return {
        
        init: function(game) {
            this.tilemap = game.add.group();
            this.isometric = game.add.group();
            this.gui = game.add.group();
        }
        
    };
});