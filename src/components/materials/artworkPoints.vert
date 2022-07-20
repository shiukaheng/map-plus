// attribute float size;
// attribute vec3 customColor;
uniform float size;
#include <fog_pars_vertex>

void main() {

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    gl_PointSize = size * ( 300.0 / -mvPosition.z );

    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>

}