/*
Copyright 2021 Southwest Research Institute (SwRI)

Author: George Adams
Principal Engineer, SwRI
6220 Culebra Road
San Antonio, Texas 78238-5166
gadams@swri.org, (210) 522-4957

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in the
Software without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnised to do so, subject to the
following conditions.

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
Record of Changes:
    January 13, 2022: Baseline
*/

export const R30_AStar = {

    poiGeoJSON: null,
    nodesGeoJSON: null,
    edgesGeoJSON: null,
    adjacencyJSON: null,   
    nearestJSON: null,
    distanceJSON: null,
    pathsGeoJSON: null,

    nodes: {},
    edges: {},

    Path: class {
        constructor(endPoint1, endPoint2, distance, coordinates) {
            this.endPoint1 = endPoint1;
            this.endPoint2 = endPoint2;
            this.distance = distance;
            this.coordinates = coordinates;
        };

        get _endPoint1() {
            return this.endPoint1;
        };

        get _endPoint2() {
            return this.endPoint2;
        };

        get _distance() {
            return this.distance;
        };

        get _coordinates() {
            return this.coordinates;
        };

        set _endPoint1(endPoint) {
            this.endPoint1 = endPoint;
        };

        set _endPoint2(endPoint) {
            this.endPoint2 = endPoint;
        };

        set _distance(distance) {
            this.distance = distance;
        };

        set _coordinates(coordinates) {
            this.coordinates = coordinates;
        }

        
    },

    Location: class {
        //parentId = null;
        constructor(nodeId, parameters) {
            this.nodeId = nodeId;
            this.barrier = parameters[0];
            this.coordinates = parameters[1];
            this.parentId = null;
            this.edgeId = null;
            this.F = 0;
            this.G = 0;
            this.H = 0;

        };

        get _nodeId() {
            return this.nodeId;
        };

        get _barrier() {
            return this.barrier;
        };

        get _coordinates() {
            return this.coordinates;
        };

        get _parentId() {
            return this.parentId;
        };

        get _edgeId() {
            return this.edgeId;
        };

        get _F() {
            //console.log("getting f");
            return this.F;
        };

        get _G() {
            return this.G;
        };

        get _H() {
            return this.H;
        };

        set _nodeId(nodeId) {
            this.nodeId = nodeId;
        };

        set _barrier(barrier) {
            this.barrier = barrier;
        };

        set _coordinates(coordinates) {
            this.coordinates = coordinates;
        };        

        set _parentId(parentId) {
            //console.log("setting parent to: " + parentId);
            this.parentId = parentId;
        };

        set _edgeId(edgeId) {
            this.edgeId = edgeId;
        };

        set _G(G) {
            this.G = G;
            this.F = this.G + this.H;
        };

        set _H(H) {
            this.H = H;
            this.F = this.G + this.H;
        };        

    },

    convertToRadians(degrees) {
        return (Math.PI/180.0) * degrees;
    },    

    getHaversineDistance: function(coord1, coord2) {

        let [lon1, lat1] = coord1.map(this.convertToRadians);
        let [lon2, lat2] = coord2.map(this.convertToRadians);
   
        let radius = 6371; // Earth's radius in kilometers

        let deltaLat = lat2-lat1;
        let deltaLong = lon2 - lon1;

        let a = Math.sin(deltaLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLong/2)**2;
        let c = 2 * Math.asin(Math.sqrt(a));

        return c * radius;
        
    },    

    generatePath(closedList) {

        //console.log("in generatePath");
        //console.log(closedList);

        if(closedList == null) {
            return null;
        }

        if(closedList.length <= 1) { //Need at least two elements in the closed list to generate a path
            return null;
        }

        let starting_node_id = closedList[0]._nodeId;
        let distance = 0;
        let coordinates = [];
        let location = closedList.pop();
        let target_node_id = location._nodeId
    
        // Begin traversing the closed list backwards to build the path
        let parent_id = location._parentId;
        //console.log("parent id: " + parent_id);
        while(true) {
            let edge_id = location._edgeId;
            //console.log("edge id: " + edge_id);
            
            distance = distance + this.edges[edge_id][0]/1000.0;
            //console.log("distance: "  + distance);
            coordinates.push(this.edges[edge_id][1]);
            //console.log("coordinates: ");
            //console.log(coordinates);
            let index_find_closed = closedList.findIndex((element) => element._nodeId == parent_id);
            if(index_find_closed == -1) { //did not find parent
                //console.log("Error traversing path - did not find parent node");
                return null;
            }
            location = closedList.splice(index_find_closed, 1)[0];
            parent_id = location._parentId;
            //console.log("new parent id: " + parent_id);

            //Check stopping condition
            if(location._nodeId == starting_node_id) {
                //console.log("breaking out of loop");
                //console.log("location node id: " + location._nodeId);
                //console.log("starting node id: " + starting_node_id);
                break;
            }
 

        }

        return new this.Path(starting_node_id, target_node_id, distance, coordinates);

    },

    getPath(startingNode, targetNode) {

        //console.log("in getPath");
        //let distance = 0;
        //let coordinates = [];

        let open_list = [];
        let closed_list = [];

        //console.log("starting algorithm");
        // A-Star algorithm: 
        // 1. Add starting node to closed list.
        let current_node = new this.Location(startingNode, this.nodes[startingNode]);
        closed_list.push(current_node);
        //console.log("starting node id is: " + current_node._nodeId);

        // Continuous processing loop
        while(true) {
            
            //console.log(this.adjacencyJSON[current_node.nodeId]);
            // 2. Find the adjacent nodes to the current node and add them
            //    to the open list
            for(let adjacent_node of this.adjacencyJSON[current_node._nodeId]) {
                let adjacent_node_id = adjacent_node.node
                // If node is already on the closed list continue
                let index_find_closed = closed_list.findIndex((element) => element._nodeId == adjacent_node_id);
                if(index_find_closed != -1) { //Location found
                    continue;
                }

                // Determine if the adjacent node is a barrier. If it is do not add it
                // to the open list.
                if(this.nodes[adjacent_node_id][0]) {
                    continue;
                }

                //console.log("Building adjacent node");
                let adjacent_edge_id = adjacent_node.edge;
                //console.log("adjacent edge id: " + adjacent_edge_id);
                let adjacent_location = new this.Location(adjacent_node_id, this.nodes[adjacent_node_id]);
                //console.log("Setting parent");
                adjacent_location._parentId = current_node._nodeId;
                //console.log("Setting edge");
            
                adjacent_location._edgeId = adjacent_edge_id;
                //console.log("Setting G");
                adjacent_location._G = current_node._G + this.edges[adjacent_edge_id][0]/1000.0; //Convert to km

                //console.log("setting coordinates");
                let adjacent_coordinates = adjacent_location._coordinates;
                //console.log("Adjacent coordinates: " + adjacent_coordinates);
                let target_coordinates = this.nodes[targetNode][1];
                //console.log("Target coordinates: " + target_coordinates);
                //console.log("Calling getHaversineDistance");
                let haversine_distance = this.getHaversineDistance(adjacent_coordinates, target_coordinates);
                //console.log("Setting H");
                adjacent_location._H = haversine_distance;


                // Before adding location to the open list check to see if it is already there.
                // If it is already on the open list check to see if the path from the current node
                // is a better one.
                //console.log("Checking open list");
                let index_find_open = open_list.findIndex((element) => element._nodeId == adjacent_location._nodeId);
                if(index_find_open == -1) { // Location not found
                    //console.log("Location not found in open list - pushing location");
                    open_list.push(adjacent_location);
                } else {
                    //console.log("location found in open list - checking G");
                    if(adjacent_location._G < open_list[index_find_open]._G) { // If it is a better path, then update the item in the list
                        //console.log("Location better for open list - updating location");
                        open_list[index_find_open] = adjacent_location;
                    }
                }              

            }

            // 3. Choose the lowest F score from the open list. Drop it from the open list and
            //   add it to the closed list
    
            // If the open list is empty then there is no path 
            if(open_list.length == 0) {
                //console.log("open list is empty");
                //console.log("starging node: " + startingNode);
                //console.log("target node: " + targetNode);
                return null;   
            }
            
            // First sort the list so that the first element has the lowest F score
            open_list.sort(function(a,b){return a._F - b._F});
            //console.log("Sorted open list: ");      
            //console.log(open_list);

            // Get the best item from the open list and add it to the closed list
            current_node = open_list.shift(); //Remove the first element


            //console.log("Current node id adding to closed list: " + current_node._nodeId);
            closed_list.push(current_node);

            // Check for stop condition: target location added to the closed list
            if(current_node._nodeId == targetNode) { // Found the path
                //console.log("found the path");
                //console.log("current node id: " + current_node._nodeId);
                //console.log("target node: " + targetNode);
                break;
            }      

            //console.log("Closed list");
            //console.log(closed_list);

        }

        let path = this.generatePath(closed_list);
        //console.log("Path");
        //console.log(path);

        return {endPoint1: path._endPoint1, endPoint2: path._endPoint2, distance: path._distance, coordinates: path._coordinates};
    },


    generateDistanceMatrix: function (inputDataset) {

        //console.log("in generate distance matrix");
        R30_AStar.poiGeoJSON = inputDataset.pois;
        //console.log("first value");
        R30_AStar.nodesGeoJSON = inputDataset.nodes;
        //console.log("second value");
        R30_AStar.edgesGeoJSON = inputDataset.edges;
        R30_AStar.adjacencyJSON = inputDataset.adjacency;
        R30_AStar.nearestJSON = inputDataset.nearest;

        //console.log("logging features");
        //console.log(R30_AStar.nodesGeoJSON.features);
        for(let node of R30_AStar.nodesGeoJSON.features) {
            R30_AStar.nodes[node.id] = [node.properties.barrier, node.geometry.coordinates];
        }
        //console.log(R30_AStar.nodes);

        for(let edge of R30_AStar.edgesGeoJSON.features) {
            R30_AStar.edges[edge.id] = [edge.properties.length, edge.geometry.coordinates];
        }
        //console.log(R30_Astar.edges);

        //Need an array of unique node values corresponding to pois
        let node_list = Array.from(new Set(Object.values(R30_AStar.nearestJSON)));

        // Build the GeoJSON Paths
        R30_AStar.pathsGeoJSON = {
            "type": "FeatureCollection",
            "features": []
        };

        let null_paths = [];
        let accepted_paths = [];
        for(let index_start = 0; index_start < node_list.length; index_start++) {
            let starting_node = node_list[index_start];
            let index_target = index_start + 1;
            //console.log(" Starting Node: " + starting_node);

            while(index_target < node_list.length) {
                let target_node = node_list[index_target];
                //console.log("Target Node: " + target_node);

                let path = R30_AStar.getPath(starting_node, target_node);
                //console.log("**PATH");
                //console.log(path);
                //console.log("Distance: " + path.distance);
                let feature = {};
                
                if(path != null) {
                    feature = {
                        "type": "Feature",
                        "id": path.endPoint1 + "-" + path.endPoint2,
                        "properties": {
                            "distance": path.distance,
                            "endpoint_1": path.endPoint1,
                            "endpoint_2": path.endPoint2,
                        },
                        "geometry": {
                            "type": "MultiLineString",
                            "coordinates": path.coordinates
                        }
                    
                    };
                    R30_AStar.pathsGeoJSON.features.push(feature);
                    accepted_paths.push(starting_node + "-" + target_node);
                } else {
                    null_paths.push(starting_node + "-" + target_node);
                };
                
                //R30_AStar.pathsGeoJSON.features.push(feature);
                //console.log(path);
                index_target = index_target + 1;
            }
        }

        //console.log("Null Paths");
        //console.log(null_paths);
        // Now build the distance JSON
        //console.log("building distance json");
        R30_AStar.distanceJSON = {};
        //console.log("set distance json");
        
        for(let poi1 of R30_AStar.poiGeoJSON.features) {
            
            R30_AStar.distanceJSON[poi1.id] = {}
            for(let poi2 of R30_AStar.poiGeoJSON.features) {
                if(poi1.id == poi2.id) { // Distances are zero on the diagonal
                    R30_AStar.distanceJSON[poi1.id][poi2.id] = null;
                } else if(R30_AStar.nearestJSON[poi1.id] == R30_AStar.nearestJSON[poi2.id]) {
                    R30_AStar.distanceJSON[poi1.id][poi2.id] = null;
                } else if(accepted_paths.includes(R30_AStar.nearestJSON[poi1.id] + "-" + R30_AStar.nearestJSON[poi2.id])) {
                    R30_AStar.distanceJSON[poi1.id][poi2.id] = R30_AStar.nearestJSON[poi1.id] + "-" + R30_AStar.nearestJSON[poi2.id];
                } else if(accepted_paths.includes(R30_AStar.nearestJSON[poi2.id] + "-" + R30_AStar.nearestJSON[poi1.id])) {
                    R30_AStar.distanceJSON[poi1.id][poi2.id] = R30_AStar.nearestJSON[poi2.id] + "-" + R30_AStar.nearestJSON[poi1.id];
                } else {
                    R30_AStar.distanceJSON[poi1.id][poi2.id] = null; //Could not find path
                }

            }

        }


        //console.log("returning from generateDistanceMatrix");
        return {pois: R30_AStar.poiGeoJSON, distance: R30_AStar.distanceJSON, paths: R30_AStar.pathsGeoJSON};

    }


}