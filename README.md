# WebGIS : Selecting Best Rented Room Web Service
This is the project making web service that helps user to choose best rented room in Gwangjin-gu, Seoul, Korea.
If you want to know the best house to live, use this service.
This map offers information of time to each facility.


## Interface
![interface1](https://user-images.githubusercontent.com/25999141/42417615-93e4804e-82c9-11e8-9069-38608d6a2629.png)


### 1. Menu Bar

### 2. Side Bar
- Contents of web service are marked.
- Slide animation effect is applied.

### 3. The time required
- Required time to pub, hospital, market, school.

### 4. Security rate
- It shows you the security rate with color
- Green : good, Red : middle, Red : bad

### 5. graph of score
- This graph shows you the required time to each facility.
- The time is converted to score.

### 6. Total score
- It shows the total score of selected house.

### 7. Map
- You can see the location of houses, the way to school and facilities marked.
- You can choose the house that you want to know about score.

### 8. Etc
- You can see the map with full screen.
- You can zoom the map
- You can see the CCTV layers

## How it works
We use Turf.js and Mapquest-Routing for spatial analysis.
First, Find the nearest poi(point of interest) of each facilites from selected house.
Next, Calculate the distance and time to each facilites.
Finally, Mark the icon of facililtes and show the converted score with graph.
