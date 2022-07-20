#include <fog_pars_fragment>
uniform vec3 color;
// Get artwork_color from varying variable
varying vec3 vColor;

void main() {

    gl_FragColor = vec4( vColor, 1.0 );

    // gl_FragColor = gl_FragColor;

    // if ( gl_FragColor.a < alphaTest ) discard;
    #include <fog_fragment>

}