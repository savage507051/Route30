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

export const R30_SimulatedAnnealing = {

    poiGeoJSON: null,
    distanceJSON: null,
    pathGeoJSON: null,
    pois: [],

    reverseSegment: function(tour, start, end) {

        let neighbor_tour = [];
        for(let i = 0; i < tour.length; i++) {
            neighbor_tour.push(tour[i]);
        }

        // Define the segment
        let segment = [];
        let index_tour = start;

        while(index_tour != end) {

            segment.push(neighbor_tour[index_tour]);

            index_tour++;

            if(index_tour >= neighbor_tour.length) {  // Loop around
                index_tour = 0;
            }            
        }
        segment.push(neighbor_tour[end]);  
        
        segment = segment.reverse();
        index_tour = start;
        let index_segment = 0;
        while(index_tour != end) {
            neighbor_tour[index_tour] = segment[index_segment];
            index_tour++;
            if(index_tour >= neighbor_tour.length) {
                index_tour = 0;
            }            
            index_segment++;
        }
        neighbor_tour[end] = segment[segment.length - 1];

        return neighbor_tour;
    },

    transportSegment: function(tour, start, end) {
        // Define the segment
        let segment = [];
        let index_tour = start;
        
        while(index_tour != end) {
        
            segment.push(tour[index_tour]);
        
            index_tour++;
        
            if(index_tour >= tour.length) {  // Loop around
                index_tour = 0;
            }            
        }
        segment.push(tour[end]);

        // Consider the special case where the segment is the entire tour
        // There is nothing to transport i this case.
        if(tour.length == segment.length) {
            return tour;
        }

        // Build the tour from the remaining points
        let tour_start = end + 1;
        if(tour_start >= tour.length) { // Wrap around
            tour_start = 0;
        }

        let tour_end = start - 1;
        if(tour_end < 0) { // Wrap around
            tour_end = tour.length - 1;
        }

        let neighbor_tour = [];
        index_tour = tour_start;

        while(index_tour != tour_end) {
            neighbor_tour.push(tour[index_tour]);
            index_tour++;

            if(index_tour >= tour.length) {  // Loop around
                index_tour = 0;
            }                
        }
        neighbor_tour.push(tour[tour_end]);

        // Find a random place on the neighbor tour
        let transport_location = Math.floor((neighbor_tour.length)* Math.random());

        // Put the segment at the transport location
        neighbor_tour.splice(transport_location, 0, ...segment);

        return neighbor_tour;

    },
    
    getTourLength: function(tour) {
        let tour_length = 0;
        let path_id = null;

        for(let i = 0; i < tour.length - 1; i++) {

            // First find the path id
            path_id = this.distanceJSON[tour[i]][tour[i+1]];

            // Get the distance for this path
            if(path_id != null) {
                tour_length = tour_length + this.pathGeoJSON.features.find(x => x.id === path_id).properties.distance;
            }

        }  

        // Now connect the ends
        path_id = this.distanceJSON[tour[tour.length-1]][tour[0]];

        if(path_id != null) {
            tour_length = tour_length + this.pathGeoJSON.features.find(x => x.id === path_id).properties.distance;
        }
        
        return parseFloat(tour_length.toFixed(3));
    },

    checkSolution: function(newLength, oldLength, temp_value) {
 
        if(newLength < oldLength) {
            return true; // new solution is better
        }else if(newLength == oldLength) {
           return false; // new solution is no better
        } else {
            //Depending on the temperature, a worse solution may be accepted.
            //At higher temperatures there is a greater chance of accepting a worse
            //solution
            //console.log("Delta Distance: " + (newLength-oldLength));
            let check = Math.exp(-1 * (newLength - oldLength) / temp_value);           
            let random_value = Math.random();
            
            if(random_value < check) {
                return true; //Accept a solution that is worse
            } else {
                return false; //Do not accept the solution that is worse
            }

        }

    },


    optimizeTour: function(tour, parameters) {
        //console.log("in optimizeTour");
        
        let best_tour = tour;
        let temperature = parameters[0];
        let temperature_factor = parameters[1];

        let num_temperature_steps = parameters[2];
        let max_attempts = parameters[3]; // Number of attempts at each temperture
        let max_successes = parameters[4]; // Break out early at each temperature after this number of successes
        let num_successes = 0;

        // Initial tour length
        //console.log("optimize tour getting tour length");
        let tour_length = this.getTourLength(tour);
        //console.log(tour_length);
        
        //Start the simulated annealing process
        for(let i = 0; i < num_temperature_steps; i++) {
            num_successes = 0;
            for(let j = 0; j < max_attempts; j++) {
                
                //console.log("mark A");
                // First select a segment within the tour
                let segment_start = Math.floor(best_tour.length * Math.random());
                let segment_end = Math.floor(best_tour.length * Math.random());

                // Decide if this will be a reverse or transport
                let decision = Math.floor(2 * Math.random());
                let neighbor_tour = [];
                //console.log("mark B");
                if(decision == 0) { //Transport
                    neighbor_tour = this.transportSegment(best_tour, segment_start, segment_end);
                } else { //Reverse
                    neighbor_tour = this.reverseSegment(best_tour, segment_start, segment_end);
                }
                //console.log("mark C");
                //console.log(neighbor_tour);
                let neighbor_length = this.getTourLength(neighbor_tour);

                //console.log(neighbor_length, tour_length, temperature);
                if(this.checkSolution(neighbor_length, tour_length, temperature)) {
                    best_tour = neighbor_tour;
                    tour_length = neighbor_length;
                    //console.log("tour length: " + tour_length);
                    num_successes++;
                    //console.log("Number of successes: " + num_successes);
                }
                //console.log("mark D");
                
                if(num_successes >= max_successes) {
                    break;
                }

            }

            
            temperature = temperature * temperature_factor;
            
            if(num_successes == 0) {
                //console.log("number of successes fell to zero at temperature: " + temperature);
                //console.log("temperature step: " + i);
                return best_tour;
            }
        }
        //console.log("Fell past last temperature: returning best tour");
        //console.log("Number of successes: " + num_successes);
        
        return best_tour;

    },

    setupTour: function(numRemove) {

        let tour = [];

        for(let i=numRemove; i < this.pois.length; i++) {
            tour.push(this.pois[i].id);
        }

        tour.sort(function(a, b){return 0.5 - Math.random()}); // Start with a random tour
        
        return tour;

    },

    convertToRadians(degrees) {
        return (Math.PI/180.0) * degrees;
    },

    getHaversineDistance: function(coord1, coord2) {

        //console.log("in haversine");
        let [lon1, lat1] = coord1.map(this.convertToRadians);
        let [lon2, lat2] = coord2.map(this.convertToRadians);
   
        let radius = 6371; // Earth's radius in kilometers

        let deltaLat = lat2-lat1;
        let deltaLong = lon2 - lon1;

        let a = Math.sin(deltaLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLong/2)**2;
        let c = 2 * Math.asin(Math.sqrt(a));

        return c * radius;
        
    },

    arrangeTour: function(start, tour) {

        //console.log("in arrangeTour");
        let return_tour = tour;
        let tour_count = 0;

        while(tour_count < return_tour.length) {
            //console.log("tour count: " + tour_count);
            if(start == return_tour[0]) {
                break;
            }
            let element = return_tour.shift();
            return_tour.push(element);
            tour_count = tour_count + 1;
        }   

        //console.log("returning from arrange tour");

        return return_tour;

    },

    buildGeoJSONTour: function(tour) {

        let route = {};
        let route_properties = {};
        let route_geometry = {};
        
        let tour_length = 0;
        let coordinates = [];
        let segments = null;
        let path_id = null;

        for(let i = 0; i < tour.length - 1; i++) {

            // First find the path id
            path_id = this.distanceJSON[tour[i]][tour[i+1]];
            
            // Get the distance for this path
            if(path_id != null) {
                tour_length = tour_length + this.pathGeoJSON.features.find(x => x.id === path_id).properties.distance;

                segments = this.pathGeoJSON.features.find(x => x.id === path_id).geometry.coordinates;
             
                for(let segment_no in segments) {
                    coordinates.push(segments[segment_no]);
                }
            }

        }

        // Now connect the ends
        path_id = this.distanceJSON[tour[tour.length-1]][tour[0]];
        if(path_id != null) {
            tour_length = tour_length + this.pathGeoJSON.features.find(x => x.id === path_id).properties.distance;

            segments = this.pathGeoJSON.features.find(x => x.id === path_id).geometry.coordinates;
            
            for(let segment_no in segments) {
                
                coordinates.push(segments[segment_no]);
            }
        }        

        route_properties = {"distance": tour_length, "path": tour};
        route_geometry = {"type": "MultiLineString", "coordinates": coordinates};
        route = {"type": "Feature", "properties": route_properties, "geometry": route_geometry};

        return(route);
    },

    generateRoute: function (routeParameter, poi, distance, path) {

        R30_SimulatedAnnealing.poiGeoJSON = poi;
        R30_SimulatedAnnealing.distanceJSON = distance;
        R30_SimulatedAnnealing.pathGeoJSON = path;

        // Initialize the set of POIs
        R30_SimulatedAnnealing.pois.length = 0;
        for(let i = 0; i < R30_SimulatedAnnealing.poiGeoJSON.features.length; i++) {
            //console.log("mark1");
            // Determine if this poi has been filtered out
            let filtered_out = false;
            
            for(let ifilter = 0; ifilter < routeParameter.poiFilter.length; ifilter++) {
                if(!routeParameter.poiFilter[ifilter].includes(R30_SimulatedAnnealing.poiGeoJSON.features[i].properties.criteria[ifilter])) {
                    filtered_out = true;
                }
            }
        
            //console.log("mark2");
            if(filtered_out) {
                continue;
            }
            
            //console.log("mark3");
            R30_SimulatedAnnealing.pois.push({id: R30_SimulatedAnnealing.poiGeoJSON.features[i].id, 
                distance: R30_SimulatedAnnealing.getHaversineDistance(routeParameter.userStart,
                    R30_SimulatedAnnealing.poiGeoJSON.features[i].geometry.coordinates)});
        }

        
        // Sort POIs by distance from the user in descending order.
        R30_SimulatedAnnealing.pois.sort(function(a, b){return b.distance - a.distance});
        
        let starting_poi_id = R30_SimulatedAnnealing.pois[R30_SimulatedAnnealing.pois.length - 1].id;

        //Build optimal tour using simulated annealing
        let tour = R30_SimulatedAnnealing.setupTour(0);
        let optimum_tour = R30_SimulatedAnnealing.optimizeTour(tour, routeParameter.algorithm);
        let tour_length = R30_SimulatedAnnealing.getTourLength(optimum_tour);

        let num_remove = 0;
        let nodes_removed = [];
        if(routeParameter.maxDistance > 0) { // Need to check if distance falls within user limit
            while((tour_length > routeParameter.maxDistance) && (num_remove < R30_SimulatedAnnealing.pois.length - 1)) {
                num_remove++;
                tour = R30_SimulatedAnnealing.setupTour(num_remove);
                optimum_tour = R30_SimulatedAnnealing.optimizeTour(tour, routeParameter.algorithm);
                tour_length = R30_SimulatedAnnealing.getTourLength(optimum_tour);
                nodes_removed.push(R30_SimulatedAnnealing.pois[num_remove-1].id);
            }

            //Some nodes were removed, but there may have been no improvement in route length when
            //removing those nodes.
            //Check if any of these removed nodes could be added back in without increasing the overall
            //route length past the maximum distance.
            for(let index_test = 0; index_test < nodes_removed.length; index_test++) {
                let test_tour = optimum_tour.slice();
                test_tour.push(nodes_removed[index_test]);
                test_tour.sort(function(a, b){return 0.5 - Math.random()}); // Start with a random tour
                let optimum_test_tour = R30_SimulatedAnnealing.optimizeTour(test_tour, routeParameter.algorithm);
                let test_tour_length = R30_SimulatedAnnealing.getTourLength(optimum_test_tour);
                if(test_tour_length <= routeParameter.maxDistance) {
                    //Valid to add node back in
                    optimum_tour = optimum_test_tour;
                    tour_length = test_tour_length;
                }
            }
        }

        //console.log("arranging tour");
        optimum_tour = R30_SimulatedAnnealing.arrangeTour(starting_poi_id, optimum_tour);
        //console.log(optimum_tour);

        let tour_geoJSON = R30_SimulatedAnnealing.buildGeoJSONTour(optimum_tour);
        return tour_geoJSON;        

    },

    generateRouteTuning: function (routeParameter, poi, distance, path, acceptable) {

        R30_SimulatedAnnealing.poiGeoJSON = poi;
        R30_SimulatedAnnealing.distanceJSON = distance;
        R30_SimulatedAnnealing.pathGeoJSON = path;

        // Initialize the set of POIs
        R30_SimulatedAnnealing.pois.length = 0;
        for(let i = 0; i < R30_SimulatedAnnealing.poiGeoJSON.features.length; i++) {
            
            if(!acceptable.includes(R30_SimulatedAnnealing.poiGeoJSON.features[i].id)) {
                continue;
            }
        
            //console.log("mark2");
            
            //console.log("mark3");
            R30_SimulatedAnnealing.pois.push({id: R30_SimulatedAnnealing.poiGeoJSON.features[i].id, 
                distance: R30_SimulatedAnnealing.getHaversineDistance(routeParameter.userStart,
                    R30_SimulatedAnnealing.poiGeoJSON.features[i].geometry.coordinates)});
        }

        //console.log("mark4");
        // Sort POIs by distance from the user in descending order.
        R30_SimulatedAnnealing.pois.sort(function(a, b){return b.distance - a.distance});
        
        let starting_poi_id = R30_SimulatedAnnealing.pois[R30_SimulatedAnnealing.pois.length - 1].id;

        //Build optimal tour using simulated annealing
        let tour = R30_SimulatedAnnealing.setupTour(0);
        let optimum_tour = R30_SimulatedAnnealing.optimizeTour(tour, routeParameter.algorithm);
        //let tour_length = R30_SimulatedAnnealing.getTourLength(optimum_tour);


        //console.log("arranging tour");
        optimum_tour = R30_SimulatedAnnealing.arrangeTour(starting_poi_id, optimum_tour);
        //console.log(optimum_tour);

        let tour_geoJSON = R30_SimulatedAnnealing.buildGeoJSONTour(optimum_tour);
        
        //console.log("returning from generateRoute");
        return tour_geoJSON;        

    },


}