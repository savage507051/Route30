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

export const R30_Distance = {

    poiGeoJSON: null,
    nodesGeoJSON: null,
    edgesGeoJSON: null,
    adjacencyJSON: null,   
    nearestJSON: null,


    buildAdjacencyList: function (routeParameter) {
        //console.log("in buildAdjacencyList");
        this.adjacencyJSON = {};
        
        let node_features = this.nodesGeoJSON.features;
        let edge_features = this.edgesGeoJSON.features;
        //console.log(features);
        for(let node in node_features) {
            //console.log(node_features[node]);
            let node_id = node_features[node].id;
            this.adjacencyJSON[node_id] = [];
            
            for(let edge in edge_features) {
                let properties = edge_features[edge].properties;

                // Do not add edges that are barriers
                if(properties.barrier) {
                    continue;
                }

                let filtered_out = false;    
                for(let ifilter = 0; ifilter < routeParameter.edgeFilter.length; ifilter++) {
                    if(!routeParameter.edgeFilter[ifilter].includes(properties.criteria[ifilter])) {
                        filtered_out = true;
                    }
                }
                if(filtered_out) {
                    continue;
                }
                
                if (properties["from"] == node_id) {
                    this.adjacencyJSON[node_id].push({node:properties["to"], edge:edge_features[edge].id});
                }

                if (properties["to"] == node_id) {
                    this.adjacencyJSON[node_id].push({node:properties["from"], edge:edge_features[edge].id});
                }

            }
        }
        //console.log("Adjacency Dictionary");
        //console.log(this.adjacencyJSON);
    },

    readFile: function(file, parameter) {
        const xhttp = new XMLHttpRequest();

        // Define a callback function
        xhttp.onload = function() {
            const response = this.responseText;

            switch (parameter) {
                case "poi":
                    R30_Distance.poiGeoJSON = JSON.parse(response);
                    //console.log(R30_Distance.poiGeoJSON);
                    break;
                case "nodes":
                    R30_Distance.nodesGeoJSON = JSON.parse(response);
                    //console.log(R30_Distance.nodesGeoJSON);
                    break;
                case "edges":
                    R30_Distance.edgesGeoJSON = JSON.parse(response);
                    //console.log(R30_Distance.edgesGeoJSON);
                    break;
            }            

        }

        // Send a request
        xhttp.open("GET", file);
        xhttp.send();	        
    },

    loadData: function(filePOI, fileNodes, fileEdges) {
        // Get POIs
        this.readFile(filePOI, "poi");

        // Get the nodes and edges street files
        this.readFile(fileNodes, "nodes");
        this.readFile(fileEdges, "edges");

    },

    convertToRadians: function(degrees) {
        return (Math.PI/180.0) * degrees;
    },

    getHaversineDistance: function(coord1, coord2) {

        //console.log("In getHaversineDistance");

        let [lon1, lat1] = coord1.map(this.convertToRadians);
        let [lon2, lat2] = coord2.map(this.convertToRadians);
   
        let radius = 6371; // Earth's radius in kilometers

        let deltaLat = lat2-lat1;
        let deltaLong = lon2 - lon1;

        let a = Math.sin(deltaLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLong/2)**2;
        let c = 2 * Math.asin(Math.sqrt(a));

        return c * radius;
        
    },

    findNearestNode: function () {
        //console.log("in findNearestNode");

        this.nearestJSON = {};

        let node_features = this.nodesGeoJSON.features;
        let poi_features = this.poiGeoJSON.features;
        //console.log(features);
        for(let poi in poi_features) {
            let distance = 100000;
            let poi_coordinates = poi_features[poi].geometry.coordinates;
            //console.log("poi coordinates: " + poi_coordinates);

            for(let node in node_features) {
                let node_coordinates = node_features[node].geometry.coordinates;
                //console.log("node coordinates: " + node_coordinates);
                let haversine_distance = this.getHaversineDistance(poi_coordinates, node_coordinates);
                //console.log("haversine distance: " + haversine_distance);
                if(distance > haversine_distance) {
                    distance = haversine_distance;
                    this.nearestJSON[poi_features[poi].id] = node_features[node].id;
                }
            }
        }

        //console.log("Nearest Nodes");
        //console.log(this.nearestJSON);

    },

    setupDistanceInput: function(routeParameter) {

        this.buildAdjacencyList(routeParameter);
        this.findNearestNode();

        return {pois: this.poiGeoJSON, nodes: this.nodesGeoJSON, edges: this.edgesGeoJSON, 
                adjacency: this.adjacencyJSON, nearest: this.nearestJSON};

    },

    buildDistanceMatrix(routeParameter, algorithm) {

        //Will use the parameter in the future
        //console.log(parameter);

        //Setup the distance matrix
        let distance_input = this.setupDistanceInput(routeParameter);
        //console.log("Distance input");
        //console.log(distance_input);

        //console.log("Calling routing algorithm");
        return(algorithm(distance_input));

    }
    
}
