# Route30
Author: George Adams, Southwest Research Institute® (SwRI®)

Date: March 27, 2022

Route30 is a client-side JavaScript routing library.

This library is developed as a capstone project in the MGIS program at Penn State.

The purpose of this library is to allow web app developers to incorporate routing in their applications. The routing library is intended to be a simple, cost-effective solution that may be particularly useful to local governments and non-profits.

## Web App
A demo web app was developed to show how the library could be used. The demo web app can be accessed using the following QR code:

![Route30_QR](https://user-images.githubusercontent.com/76443534/159126640-fa3a9d6d-d21d-4d87-8db6-efef5c8d6f44.png)

### User Interface
The following image is the user interface for the historical walking tour web app in Castroville, Texas. There are 30 points of interest (POIs). Highway 90 is the wide roadway that crosses through the historic district from east to west. A tour has been generated (shown in orange). The tour is displayed in the list on the right side of the figure. On the left side of the screen are the control buttons. The functionality invoked from these buttons is described next.

<img src="https://user-images.githubusercontent.com/76443534/159188710-ae16d033-0bfe-4c2a-a8ed-ea79d989db00.jpg" width="600" height="432"/><br>

### Build a Tour Screen
The tour button opens the Build a Tour screen shown below. From this screen, the tourist can filter POIs and constrain the route. POIs are filtered by type of structure and era. The route is constrained to more accessible segments or limited in length. After applying any desired filters and constraints, the tourist can generate a route by pressing the “Generate Tour” button at the bottom of the Build a Tour screen. A tourist could also clear the filters and constraints as well as any current tours by pressing the “Clear Tour” button.

<img src="https://user-images.githubusercontent.com/76443534/159188735-fd7157c7-2fdf-48d3-ac77-315933c9284c.jpg" width="500" height="421"/><br>

### Set Starting Position
The following image shows the Set Starting Position screen. The user can set their starting position manually by clicking the button on the right, or the app can find the user’s current position on the street network and use that (left button).

<img src="https://user-images.githubusercontent.com/76443534/159188751-c14f9a3f-6d61-461b-9d85-c504046cfcb9.jpg" width="300" height="148"/><br>

### Track Position
Finally, the following image shows the control buttons from the user interface. The user can track their position by pressing the last button on this figure (i.e., the Start/Stop Tracking button). This way the location icon (the man on the map) moves as the tourist walks the route.

Note that the button is a toggle button. When the user initially presses the button, the background will turn red and the text will change to "Stop Tracking." If pressed again, the background returns to the initial blue-grey color and the text changes to "Start Tracking."

<img src="https://user-images.githubusercontent.com/76443534/159188759-098a40ed-1dfd-4f01-9f4a-76aceb7e38f7.jpg" width="300" height="280"/><br>

## Design
The routing library is designed with two components: 1) a distance matrix component and 2) a route generation component. The distnce matrix component takes a set of POIs and a street network (nodes and edges) as input. It finds the shortest path between every pair of POIs and outputs this information in the form of a distance matrix using the A-Star algorithm to find the shortest paths. The purpose of the route generation component is to generate a route that is close to optimal for a set of POIs. It takes a distance matrix and set of POIs as input and uses the simulated annealing algorithm to find a best solution and generate the route. These algorithms are described next.

<img src="https://user-images.githubusercontent.com/76443534/160296850-edcb6dca-3a6a-49e9-a305-fd00f1337a65.jpg" width="300" height="131"/><br>

### A-Star Algorithm
There are two primary algorithms for finding the shortest path between POIs. One is Dijkstra’s algorithm and the other is the A-Star (or A*) algorithm. A-Star is a modification to Dijkstra’s algorithm. Whereas Dijkstra’s algorithm will search out equally from the source node, A-Star prioritizes its evaluation using a heuristic . It tries to identify the best next node for reaching the target. With its focused search, A-Star minimizes the number of calculations and can be faster than Dijkstra’s algorithm, and therefore it was selected for Route30. For additional insights on this algorithm, consult Dere, Esat, and Durdu (2018) who describe their use of the A-Star algorithm for transportation systems. Also, Swift (2017), Lester (2005), and Roy (2019) describe the A-Star algorithm with pseudocode or actual code. 

### Simulated Annealing Algorithm
The simulated annealing algorithm generates a close-to-optimal route from a distance matrix and set of POIs. The simulated annealing algorithm has its analogy in the field of metallurgy where metals are heated and then slow-cooled to relieve stresses. Similarly, this algorithm starts at a high pseudo temperature. An initial route is identified at random, then a series of transport or reversal processes are applied to that route while lowering the temperature. After each process is applied, the transformed route is evaluated to see if it has a shorter total distance. If so, that new route is kept. If not, the new route may or may not be kept depending on the temperature. As the temperature drops, fewer longer routes are accepted. The goal of this algorithm is to find a global minimum without getting stuck in a local minimum. Lojkine (2018), Jacobson (2013), Press et al. (1992), Schneider (2014), and Walker (2018) describe the simulated annealing approach in detail.

## Deploy
To deploy the web app and Route30 library, copy the data, icons, images, and library folders to a web server. Copy the files from the demo folder to the root directory.

## Additional Information
To see more information on how to build your own web app and use the library, see the user guide under the wiki tab.

Background on routing and more detailed information on Route30 is in the final report: https://github.com/savage507051/Route30/blob/main/Final_Report/FinalReport.pdf.

Route30 was presented at the 2022 Texas GIS Forum on March 9, 2022 in Austin, Texas. The presentation and associated speaker notes can be downloaded from: https://github.com/savage507051/Route30/tree/main/Presentation.

## References
Boeing, G. (2017). *U.S. Street Network Shapefiles, Node/Edge Lists, and GraphML Files.* https://doi.org/10.7910/DVN/CUWWYJ, Harvard Dataverse, V2.  

Castroville Area Chamber of Commerce (CACC). (2017). *Wilkomme…Your guide to Castroville.* Accessed September 16, 2021, from http://www.castroville.com/visitors-guide/. 

Dere, Esat & Durdu, Akif. (2018). Usage of the A* Algorithm to Find the Shortest Path in Transportation Systems. Accessed September 4, 2021, from https://www.researchgate.net/publication/325415675_Usage_of_the_A_Algorithm_to_Find_the_Shortest_Path_in_Transportation_Systems.

Jacobson, L. (2013). *Simulated annealing for beginners.* Accessed August 24, 2021, from https://www.theprojectspot.com/tutorial-post/simulated-annealing-algorithm-for-beginners/6.  

Lester, P. (2005). *A\* pathfinding for beginners.* Accessed September 4, 2021, from http://csis.pace.edu/~benjamin/teaching/cs627/webfiles/Astar.pdf.  

Lojkine, O. (2018). *Salesman.* Accessed August 24, 2021, from https://github.com/lovasoa/salesman.js.  

Press, W. H., Teukolsky, S.A, Vetterling, W.T., & Flannery, B.P. (1992). *Numerical recipes in C (2nd ed.).* Cambridge, UK: Cambridge University Press.  

Roy, B. (2019). *A-Star (A\*) search algorithm.* Accessed September 4, 2021, from https://towardsdatascience.com/a-star-a-search-algorithm-eb495fb156bb.  

Schneider, T. (2014). *The traveling salesman with simulated annealing, R, and Shiny.* Accessed August 24, 2021, from https://toddwschneider.com/posts/traveling-salesman-with-simulated-annealing-r-and-shiny/.  

Swift, N. (2017). *Easy A\* (star) pathfinding.* Accessed September 4, 2021, from https://medium.com/@nicholas.w.swift/easy-a-star-pathfinding-7e6689c7f7b2.  

Walker, J. (2018). *Simulated annealing – The travelling salesman problem.* Accessed August 24, 2021, from https://www.fourmilab.ch/documents/travelling/anneal/.
