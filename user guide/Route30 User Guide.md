# Route30 User Guide
Route30 is a client-side routing library. It was developed as free and open-source software (FOSS).

Author: George Adams, Southwest Research Institute® (SwRI®)

Date: February 7, 2022

## Data Files
There are three data files: 
1. POI (Points of Interest) file, poi.geojson: This file is created from scratch. It has the following GeoJSON structure:

    <img src="./images/pois.jpg" width="300" height="300"/>  
    
    Field definitions:
    1. id, String \[required\]: unique identifier
    2. name, String: POI name
    3. priority, Integer: Priority was intended to be used when limiting the length of a path. It is not used in this implementation
    4. popup, String: Text to be displayed in a popup
    5. criteria, StringList \[required\]: Filter criteria specified as a list of strings
    6. Year, Integer: The year the property was built
    7. Address, String: The address of the property

    In this implementation, the poi.geojson file is used as input to the routing library. The only required fields for POIs in the routing library are the "id" field, the "criteria" field, and the geometry. The other fields are only used for the demo web app. Therefore, a different and shorter poi.geojson file could have been used for the routing library.  


2. Street Network (Boeing, 2017)

## References
Boeing, G. (2017). *U.S. Street Network Shapefiles, Node/Edge Lists, and GraphML Files.* https://doi.org/10.7910/DVN/CUWWYJ, Harvard Dataverse, V2.  