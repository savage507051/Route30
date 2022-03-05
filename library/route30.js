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
    January 12, 2022: Baseline
*/

var r30_r;
var r30_d;
var astar;
var simulated_annealing;

async function R30LoadData(poi_file, nodes_file, edges_file) {
    r30_r = await import('./route30_Route.js');
    r30_d = await import('./route30_Distance.js');
    astar = await import('./route30_AStar.js');
    simulated_annealing = await import('./route30_Simulated_Annealing.js');

    r30_d.R30_Distance.loadData(poi_file, nodes_file, edges_file);
}

function R30Generate(parameter) {

    let t0_distance_component = performance.now();
    //console.log("Starting distance component");
    //Distance Component
    let distance_matrix = r30_d.R30_Distance.buildDistanceMatrix(parameter, astar.R30_AStar.generateDistanceMatrix);
    let t1_distance_component = performance.now();
    //console.log("distance matrix");
    //console.log(distance_matrix);

    //Routing Component
    //console.log("Starting routing component");

    let tour_route = null;

    let tuning = false;
    if(tuning) {

        let all_pois = ['0','1','2','3','4','5',
                        '6','7','8','9','10',
                        '11','12','13','14','15',
                        '16','17','18','19','20',
                        '21','22','23','24','25',
                        '26','27','28','29'];

        let result_array = [];
        result_array.push("Temperature, Factor, Steps, Max Attempts, Max Successes, Distance, Time Distance, Time Routing");

        let loop_parameters = [5, 10, 15, 20, 25, 30];
        for(let loop_index = 0; loop_index < loop_parameters.length; loop_index++) {
            //parameter.algorithm[3] = loop_parameters[loop_index];
            //parameter.algorithm[3] = loop_parameters[loop_index];
            parameter.algorithm[3] = 500;
            //parameter.algorithm[4] = loop_parameters[loop_index];
            parameter.algorithm[4] = 150;

            console.log("Processing loop: " + loop_index);
            let number_repeats = 100;
            for(let repeat_index = 0; repeat_index < number_repeats; repeat_index++) {
                all_pois.sort(function(a, b){return 0.5 - Math.random()}); // Start with a random tour
                //let acceptable = all_pois.slice(0, 20);
                let acceptable = all_pois.slice(0, loop_parameters[loop_index]);
                //console.log(acceptable);
                let t0_routing_component = performance.now();
                tour_route = r30_r.R30_Route.buildRouteTuning(parameter, distance_matrix.pois, distance_matrix.distance, distance_matrix.paths,
                        acceptable, simulated_annealing.R30_SimulatedAnnealing.generateRouteTuning);
                let t1_routing_component = performance.now();

                let param = parameter.algorithm;
                result_array.push(param[0] + ", " + param[1] + ", " + param[2] + ", " + 
                    param[3] + ", " + param[4] + ", " +
                    (tour_route.properties.distance).toFixed(1) + ", " +
                    (t1_distance_component - t0_distance_component).toFixed(2) + ", " +
                    (t1_routing_component - t0_routing_component).toFixed(2));
            }

        }
        for(let result_index = 0; result_index < result_array.length; result_index++) {
            console.log(result_array[result_index]);
        }
    } else {

        let t0_routing_component = performance.now();
        tour_route = r30_r.R30_Route.buildRoute(parameter, distance_matrix.pois, distance_matrix.distance, distance_matrix.paths,
                simulated_annealing.R30_SimulatedAnnealing.generateRoute);
        let t1_routing_component = performance.now();    
        
        //console.log ("Distance Component Time: " + (t1_distance_component - t0_distance_component).toFixed(2));
        //console.log("Routing Component Time: " + (t1_routing_component - t0_routing_component).toFixed(2));

    }

    return tour_route;
}