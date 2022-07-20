#include <fog_pars_fragment>
uniform vec3 color;

void main() {

    gl_FragColor = vec4( color, 1.0 );

    // gl_FragColor = gl_FragColor;

    // if ( gl_FragColor.a < alphaTest ) discard;
    #include <fog_fragment>

}