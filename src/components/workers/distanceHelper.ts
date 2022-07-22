// Worker that helps calculates distance for each point in points array to specified point

var queryPoint = null;
var points: {x: object, y:object, z:object} = {
    x: [],
    y: [],
    z: []
}
var interval = 100;

addEventListener('message', (e) => {
    const message = e.data
    switch (message.type) {
        case 'updateQueryPoint':
            queryPoint = message.data;
            break;
        case 'updatePoints':
            points = message.data;
            break;
    }
})

// Schedule a job to calculate distance for each point in points array to specified point
setInterval(() => {
    if (queryPoint !== null) {
        const indices = Object.keys(points.x);
        const distances = indices.map(index => {
            const x = points.x[index];
            const y = points.y[index];
            const z = points.z[index];
            return Math.sqrt(Math.pow(x - queryPoint[0], 2) + Math.pow(y - queryPoint[1], 2) + Math.pow(z - queryPoint[2], 2))
        });
        postMessage({type: 'updateDistance', data: distances, dt: interval})
    } else {
        postMessage({type: 'updateDistance', data: null, dt: 0})
    }
}, interval);