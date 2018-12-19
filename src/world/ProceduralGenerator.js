define(['utils/Grid2D'], function(Grid2D) {
    
    /*
    Terrain generator thing
    www.mrspeaker.net/2010/12/12/terrainer-terrain-generator/
    v1.1 of 1.0
    var _ = "mrspeaker",
        email = _ + "@gmail.com",
        twitter = "@" + _,
        web = _ + ".net";
    1. create a seed
    2. for a while...
        3. exand and copy map so each cell becomes 4 (filling map)
        4. refine map - choose cells based on surrounding cells
*/
    
    var generator = {
        
        options: {
            water: 40,   // percentage of water
            forest: 50,
            desert: 0,
            passes: 5
        },
    
        create: function() {
            var self = this;
            var grid = new Grid2D({w: 10, h: 10});
            
            console.time("generating world");
            
            grid.each(function(g) {
                var dice = Math.floor(Math.random()*100);
                var tileType = 0;
                if (dice < self.options.water) {
                    tileType = 2;
                } else if (dice > self.options.water && dice < self.options.water + self.options.desert) {
                    tileType = 4;   
                }

                g.set( tileType );
            });
            
            for (var i = 0; i < this.options.passes; i++) {
                grid = this.expand(grid);
                grid = this.pass(grid);
                
                if (i === 0) {
                    grid = this.addResources(grid);
                }
            }
            
            grid = this.createCoast(grid);
            
            console.timeEnd("generating world");
            console.log("Size: "+grid.size());
            return grid;
        },
        
        addResources: function(grid) {
            var self = this;
            grid.each(function(g) {
                if (g.get() == 0) {
                    var dice = Math.floor(Math.random()*100); 
                    if (dice < self.options.forest) {
                        g.set(3);
                    }
                }
            });
            
            return grid;
        },
        
        expand: function(old_grid) {
            var grid = new Grid2D({w: old_grid.w*2, h: old_grid.h*2});
            
            old_grid.each(function(g) {
                 grid.getCellAt(2 * g.x, 2 * g.y).set(g.get());
                 grid.getCellAt(2 * g.x + 1, 2 * g.y).set(g.get());
                 grid.getCellAt(2 * g.x, 2 * g.y + 1).set(g.get());
                 grid.getCellAt(2 * g.x + 1, 2 * g.y + 1).set(g.get());
            });
            
            return grid;
        },
        
        pass: function(grid) {
            grid.each(function(g) {
                var neighbors = g.getNeighbors();
                var borders = [];
                
                for (var k in neighbors) {
                    if (neighbors[k]) {
                        var type = neighbors[k].get();
                        borders.push(type);
                    }
                }
                
                var dice = Math.floor(Math.random() * borders.length);
                g.set( borders[dice] );
            });
            
            return grid;
        },
        
        createCoast: function(grid) {
            grid.each(function(g) {
               if (g.get() !== 2) {
                   var neighbors = g.getNeighbors();
                   for (var k in neighbors) {
                       if (neighbors[k]) {
                           if (neighbors[k].get() == 2) {
                               g.set(1);
                           }
                       }
                   }
               }
            });
            
            return grid;
        }
        
    }; 
    
    return {
        
        create: function(opt) {
            return generator.create();
        }
        
    };
});