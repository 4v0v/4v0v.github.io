function curveThroughPoints( points, ctx ) {
	var i, n, a, b, x, y;
	for ( i = 1, n = points.length - 2; i < n; i++ ) {
		a = points[i];
		b = points[i + 1];
		x = ( a.x + b.x ) * 0.5;
		y = ( a.y + b.y ) * 0.5;
		ctx.quadraticCurveTo( a.x, a.y, x, y );
	}
	a = points[i];
	b = points[i + 1];
	ctx.quadraticCurveTo( a.x, a.y, b.x, b.y );
}

class Node {
	constructor( x, y ) {
		this.x = this.ox = x || 0.0;
		this.y = this.oy = y || 0.0;
		this.vx = 0.0;
		this.vy = 0.0;
	};
} 

var Tentacle = function( options ) {
  this.length = options.length || 10;
  this.radius = options.radius || 10;
  this.spacing = options.spacing || 20;
  this.friction = options.friction || 0.8;
  this.shade = random( 0.85, 1.1 );

  this.nodes = [];
  this.outer = [];
  this.inner = [];
  this.theta = [];

  for ( var i = 0; i < this.length; i++ ) {
    this.nodes.push( new Node() );
  }
};

Tentacle.prototype = {
  move: function( x, y, instant ) {
    this.nodes[0].x = x;
    this.nodes[0].y = y;

    if ( instant ) {
      var i, node;
      for ( i = 1; i < this.length; i++ ) {
        node = this.nodes[i];
        node.x = x;
        node.y = y;
      }
    }
  },

  update: function() {
    var i, n, s, c, dx, dy, da, px, py, node, prev = this.nodes[0];
    var radius = this.radius * settings.thickness;
    var step = radius / this.length;

    for ( i = 1, j = 0; i < this.length; i++, j++ ) {

      node = this.nodes[i];

      node.x += node.vx;
      node.y += node.vy;

      dx = prev.x - node.x;
      dy = prev.y - node.y;
      da = Math.atan2( dy, dx );

      px = node.x + cos( da ) * this.spacing * settings.length;
      py = node.y + sin( da ) * this.spacing * settings.length;

      node.x = prev.x - ( px - node.x );
      node.y = prev.y - ( py - node.y );

      node.vx = node.x - node.ox;
      node.vy = node.y - node.oy;

      node.vx *= this.friction * (1 - settings.friction);
      node.vy *= this.friction * (1 - settings.friction);

      node.vx += settings.wind;
      node.vy += settings.gravity;

      node.ox = node.x;
      node.oy = node.y;

      s = sin( da + HALF_PI );
      c = cos( da + HALF_PI );

      this.outer[j] = {
        x: prev.x + c * radius,
        y: prev.y + s * radius
      };

      this.inner[j] = {
        x: prev.x - c * radius,
        y: prev.y - s * radius
      };

      this.theta[j] = da;

      radius -= step;

      prev = node;
    }
  },

  draw: function( ctx ) {
    var h, s, v, e;

    s = this.outer[0];
    e = this.inner[0];

    ctx.beginPath();
    ctx.moveTo( s.x, s.y );
    curveThroughPoints( this.outer, ctx );
    curveThroughPoints( this.inner.reverse(), ctx );
    ctx.lineTo( e.x, e.y );
    ctx.closePath();

    h = settings.colour.h * this.shade;
    s = settings.colour.s * 100 * this.shade;
    v = settings.colour.v * 100 * this.shade;

    ctx.fillStyle = 'hsl(' + h + ',' + s + '%,' + v + '%)';
    ctx.fill();

    if ( settings.thickness > 2 ) {
      v -= -10;
      ctx.strokeStyle = 'hsl(' + h + ',' + s + '%,' + v + '%)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
};

// class Squid {
// 	constructor(x, y) {
// 		this.tentacles = []

// 		for ( var i = 0; i < 100; i++ ) {
//       var tentacle = new Tentacle({
//         length: random( 10, 20 ),
//         radius: random( 0.05, 1.0 ),
//         spacing: random( 0.2, 1.0 ),
//         friction: random( 0.7, 0.88 )
//       });

//       tentacle.move( x, y, true );
//       tentacles.push( tentacle );
//     }
// 	}
// 	update() {}
// 	draw(ctx) {}
// } 

var settings = {
  headRadius: 60,
  thickness: 3,
  tentacles: 40,
  friction: 0.2,
  gravity: 0,
  colour: { h:0, s:0, v:0.8 },
  length: 70,
  wind: 0
};

var ease = 0.1;
var radius = settings.headRadius;
var tentacles = [];
var center = { x:0, y:0 };

Sketch.create({
  container: document.getElementById( 'container' ),

  setup: function() {
    center.x = this.width / 2;
    center.y = this.height / 2;


    for ( var i = 0; i < 100; i++ ) {
      var tentacle = new Tentacle({
        length: random( 10, 20 ),
        radius: random( 0.05, 1.0 ),
        spacing: random( 0.2, 1.0 ),
        friction: random( 0.7, 0.88 )
      });

      tentacle.move( this.width / 2, this.height / 2, true );
      tentacles.push( tentacle );
    }
  },

  update: function() {
		// pulse
    var pulse = pow( sin( this.millis * 0.001 * PI ), 18 );
    radius = settings.headRadius * 0.5 + settings.headRadius * 0.5 * pulse;

		// follow mouse
		ease += ( 0.7 - ease ) * 0.05;
		center.x += ( this.mouse.x - center.x ) * ease;
		center.y += ( this.mouse.y - center.y ) * ease;

		// move tentacles
    var px, py, theta, tentacle;
    var step = TWO_PI / settings.tentacles;
    for ( var i = 0, n = settings.tentacles; i < n; i++ ) {
      tentacle = tentacles[i];
      theta = i * step;
      px = cos( theta ) * radius;
      py = sin( theta ) * radius;
      tentacle.move( center.x + px, center.y + py );
      tentacle.update();
    }
  },

  draw: function() {
		// tentacles
    this.globalAlpha = 1.0;
    for ( var i = 0, n = settings.tentacles; i < n; i++ ) {
      tentacles[i].draw( this );
		}

		// head
		var h = settings.colour.h * 0.95;
		var s = settings.colour.s * 100 * 0.95;
		var v = settings.colour.v * 100 * 0.95;
		var w = v - 10 ;

		this.beginPath();
		this.arc( center.x, center.y, radius + settings.thickness, 0, TWO_PI );
		this.lineWidth = settings.headRadius * 0.3;
		this.globalAlpha = 0.2;
		this.strokeStyle = 'hsl(' + h + ',' + s + '%,' + w + '%)';
		this.stroke();

    this.globalAlpha = 1.0;
    this.beginPath();
    this.arc( center.x, center.y, radius + settings.thickness, 0, TWO_PI );
    this.fillStyle = 'hsl(' + h + ',' + s + '%,' + v + '%)';
    this.fill();
  },
});

var gui = new dat.GUI();
gui.add( settings, 'headRadius' ).min( 0.0 ).max( 100.0 )
gui.add( settings, 'tentacles' ).min( 1 ).max( 100 )
gui.add( settings, 'thickness' ).min( 1.0 ).max( 40.0 )
gui.add( settings, 'length' ).min( 10.0 ).max( 100.0 )
gui.add( settings, 'gravity' ).min( -3.0 ).max( 3.0 )
gui.add( settings, 'wind' ).min( -3.0 ).max( 3.0 )
gui.add( settings, 'friction' ).min( 0.0 ).max( 1.0 )
gui.addColor( settings, 'colour' );
gui.close();
