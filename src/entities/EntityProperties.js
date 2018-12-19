define([], function() {
   function TileProperties(entity) {
       this.entity = entity;
       
       this.properties = {
            player: false,
            ViewRadius: 0
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