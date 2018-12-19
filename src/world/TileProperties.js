define([], function() {
   function TileProperties(tile) {
       this.tile = tile;
       
       this.properties = {
           dark: true,
           walkable: (tile.type === 0)?true:false
       };
   }
    
    TileProperties.prototype = {
        
        get: function(name) {
            if (this.properties[name] !== undefined) {
                return this.properties[name];
            } else {
                console.warn("Property not found", name);
            }
        },
        
        set: function(name, value) {
            this.properties[name] = value;   
        }
    };
    
    return TileProperties;
    
});