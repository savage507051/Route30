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

export const R30_Route = {
    
    buildRoute: function(routeParameter, poi, distance, path, algorithm) { 

        return algorithm(routeParameter, poi, distance, path);
    
    },

    buildRouteTuning: function(routeParameter, poi, distance, path, acceptable, algorithm) { 

        return algorithm(routeParameter, poi, distance, path, acceptable);
    
    }

}
