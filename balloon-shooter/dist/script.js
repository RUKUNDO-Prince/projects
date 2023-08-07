const Color = {
  White: "255, 255, 255",
  Steel: "96, 125, 139",
  
  Red: "239, 83, 80",
  Orange: "255, 160, 0",
  Yellow: "253, 216, 53",
  Green: "42, 252, 152",
  Blue: "41, 121, 255",
  Indigo: "57, 73, 171",
  Violet: "103, 58, 183"
}

const State = {
  balloons: [],
  colors: [
    Color.Red, 
    Color.Orange, 
    Color.Yellow, 
    Color.Green, 
    Color.Blue, 
    Color.Indigo, 
    Color.Violet
  ],
  context: null,
  index: 0,
  params: {
    balloon: {
      frequency: 600,
      size: 4
    },
    duration: {
      slow: 500,
      medium: 250,
      fast: 100
    },
    reticle: {
      accent: Color.White,
      color: Color.Steel,
      radius: 40,
      thickness: 2
    }
  },
  position: { x: 0, y: 0 },
  splatter: {
    color: Color.White,
    lines: []
  },
  timestamps: {
    clickAt: null,
    popAt: null
  }
}

const N = {
  clamp: (min, value, max) => Math.min(Math.max(min, value), max),
  rand: (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
}

const Mapper = {
  angle: (start, end) => ({ start: start || 0, end: end || (2 * Math.PI) }),
  balloon: color => {
    const { balloon } = State.params,
          { canvas } = State.context;
    
    const height = balloon.size * 100,
          width = height * 0.8;
    
    return {
      color,
      createdAt: new Date().getTime(),
      duration: N.rand(3000, 7000),
      id: Math.random(),
      poppedAt: null,
      position: Mapper.position(N.rand(width / 2, canvas.width - (width / 2)), canvas.height + height)
    }
  },
  circle: (position, color, fill, radius, thickness, angle) => ({
    position, 
    color, 
    fill, 
    radius, 
    thickness, 
    angle: angle || Mapper.angle()
  }),
  line: (x1, y1, x2, y2, color, thickness) => ({ 
    start: Mapper.position(x1, y1), 
    end: Mapper.position(x2, y2),
    color,
    thickness
  }),
  position: (x, y) => ({ x, y }),
  rgb: value => value.substring(0, 3) === "rgb" ? value : `rgb(${value})`,
  rgba: (value, alpha) => `rgba(${value}, ${alpha})`
}

const Canvas = {
  draw: () => {
    const { context } = State;
    
    const height = context.canvas.clientHeight,
          width = context.canvas.clientWidth;

    context.canvas.height = height;
    context.canvas.width = width;   
    
    const size = 4,
          factor = width / 2000;
    
    State.params.balloon.size = N.clamp(2, size * factor, 6);
    
    State.context.clearRect(0, 0, width, height);
  },
  circle: params => {
    const { context } = State;
    
    const { angle, position } = params;
    
    context.beginPath();

    context.arc(position.x, position.y, params.radius, angle.start, angle.end);

    if(params.color && params.thickness) {
      context.lineWidth = params.thickness;
      context.strokeStyle = Mapper.rgb(params.color);
      context.stroke();
    }
    
    if(params.fill) {
      context.fillStyle = Mapper.rgb(params.fill);
      context.fill();
    }
  },
  in: path => {    
    const { context, position } = State;
    
    return context.isPointInPath(path, position.x, position.y);
  },
  line: params => {
    const { context } = State;
    
    const { start, end, color, thickness } = params;
    
    context.beginPath();

    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    
    context.lineWidth = thickness;
    context.strokeStyle = Mapper.rgb(color);
    context.lineCap = "round";

    context.stroke();
  },
  lines: lines => lines.forEach(line => Canvas.line(line))  
}

const Animate = {
  on: (initial, final, speed, timestamp) => {
    const { duration } = State.params;
    
    return Animate.value(initial, final, duration[speed] || duration.medium, State.timestamps[timestamp]);
  },
  onclick: (initial, final, speed) => Animate.on(initial, final, speed, "clickAt"),
  onpop: (initial, final, speed) => Animate.on(initial, final, speed, "popAt"),
  percent: (duration, timestamp) => {
    if(timestamp === null) return 1;
    
    const now = new Date().getTime(),
          diff = now - timestamp;
    
    return diff / duration;
  },
  value: (initial, final, duration, timestamp) => {
    const percent = Animate.percent(duration, timestamp);
    
    if(percent >= 1 || initial === final) return final;
    
    const diff = final - initial;
    
    return initial + (diff * percent);
  }
}

const Reticle = {
  borders: position => {
    const { timestamps } = State,
          { accent, color, radius, thickness } = State.params.reticle;
          
    for(let i = 0.05; i < 2; i += 0.5) {
      const angle = Mapper.angle(Math.PI * i, Math.PI * (0.4 + i)),            
            params = Mapper.circle(position, color, null, radius, thickness, angle);

      Canvas.circle(params);
    }
    
    for(let i = 0.1; i < 2; i += 0.5) {
      const angle = Mapper.angle(Math.PI * i, Math.PI * (0.3 + i)),
            color = Mapper.rgba(accent, Animate.onclick(0, 1)),
            r = Animate.onclick(radius * 1.5, radius * 0.75),
            params = Mapper.circle(position, color, null, r, thickness, angle);
      
      Canvas.circle(params);
    }
  },
  draw: () => {  
    Reticle.borders(State.position);
    
    Reticle.eye(State.position);
    
    const lines = Reticle.lines();
    
    Reticle.overlays(lines);
  },
  eye: position => {
    const { accent } = State.params.reticle;
    
    const color = Mapper.rgba(accent, Animate.onclick(0, 1)),
          radius = Animate.onclick(4, 2);
    
    Canvas.circle(Mapper.circle(position, null, color, radius));
  },
  line: (x1, y1, x2, y2) => {
    const { color, thickness } = State.params.reticle;
    
    return Mapper.line(x1, y1, x2, y2, color, thickness);
  },
  lines: () => {
    const { position } = State,
          { height, width } = State.context.canvas;
    
    const offset = State.params.reticle.radius * 0.25;
    
    const lines = [
      Reticle.line(position.x, 0, position.x, position.y - offset),
      Reticle.line(width, position.y, position.x + offset, position.y),
      Reticle.line(position.x, height, position.x, position.y + offset),
      Reticle.line(0, position.y, position.x - offset, position.y)
    ];
    
    Canvas.lines(lines);
    
    return lines;
  },
  overlay: (line, start, color) => {
    const { accent } = State.params.reticle;
    
    return { ...line, start, color: Mapper.rgba(accent, 0.75) }
  },
  overlays: lines => {
    const { height, width } = State.context.canvas;
    
    const l0 = lines[0],
          l1 = lines[1],
          l2 = lines[2],
          l3 = lines[3];
    
    const overlays = [
      Reticle.overlay(l0, Mapper.position(l0.end.x, Animate.onclick(0, l0.end.y - 1, "slow"))),
      Reticle.overlay(l1, Mapper.position(Animate.onclick(width, l1.end.x + 1, "slow"), l1.end.y)),
      Reticle.overlay(l2, Mapper.position(l2.end.x, Animate.onclick(height, l2.end.y + 1, "slow"))),
      Reticle.overlay(l3, Mapper.position(Animate.onclick(0, l3.end.x - 1, "slow"), l3.end.y))
    ];
    
    Canvas.lines(overlays);
  }
}

const Splatter = {
  draw: () => {
    const { position, splatter } = State;
    
    const lines = splatter.lines.map(line => {
      const start = Mapper.position(line.start.x + position.x, line.start.y + position.y),
            end = Mapper.position(line.end.x + position.x, line.end.y + position.y);
      
      const color = Mapper.rgba(line.color, Animate.onpop(50, 0) / 100)
    
      return Mapper.line(
        Animate.onpop(start.x, end.x, "fast"),
        Animate.onpop(start.y, end.y, "fast"),
        end.x,
        end.y,
        color,
        line.thickness
      )
    });
    
    Canvas.lines(lines);
  },
  generate: color => {
    const { radius } = State.params.reticle;
    
    const count = 16;
    
    let lines = [];
    
    for(let i = 0; i < count; i++) {
      if(i % 4 !== 0) {
        const angle = (Math.PI * 2) * (i / 16);

        const length = N.rand(radius * 0.25, radius),
              r = radius * 1.5;

        const cos = Math.cos(angle),
              sin = Math.sin(angle);
        
        lines.push(Mapper.line(
          cos * r, 
          sin * r, 
          cos * (length + r), 
          sin * (length + r),
          color,
          2
        ));
      }
    }
    
    State.splatter = { color, lines };
  }
}

const Balloon = {
  body: (size, position) => {
    const { context } = State;
    
    const rHeight = size.height * 0.5,
          rWidth = size.width * 0.5;
    
    const path = new Path2D();
    
    const a = { x: position.x, y: position.y - rHeight };
    
    path.moveTo(a.x, a.y);
    
    const b = { x: position.x + rWidth, y: position.y };
    
    const abDiff = { x: Math.abs(a.x - b.x), y: Math.abs(a.y - b.y) };
    
    path.bezierCurveTo(b.x - (abDiff.x * 0.1), a.y, b.x + (abDiff.x * 0.07), b.y - (abDiff.y * 0.36), b.x, b.y);   
    
    const c = { x: position.x, y: position.y + rHeight };
    
    const bcDiff = { x: Math.abs(b.x - c.x), y: Math.abs(b.y - c.y) };
    
    path.bezierCurveTo(b.x - (bcDiff.x * 0.05), b.y + (bcDiff.y * 0.4), c.x + (bcDiff.x * 0.5), c.y, c.x, c.y);
    
    const d = { x: position.x - rWidth, y: position.y };
    
    const cdDiff = { x: Math.abs(c.x - d.x), y: Math.abs(c.y - d.y) };
    
    path.bezierCurveTo(c.x - (cdDiff.x * 0.5), c.y, d.x + (cdDiff.x * 0.05), d.y + (cdDiff.y * 0.4), d.x, d.y);
    
    path.bezierCurveTo(d.x - (abDiff.x * 0.07), d.y - (abDiff.y * 0.36), d.x + (abDiff.x * 0.1), a.y, a.x, a.y);
    
    const e = { x: a.x + (abDiff.x * 0.3), y: a.y + (abDiff.y * 0.2) };
    
    path.moveTo(e.x, e.y);
    
    const f = { x: b.x - (abDiff.x * 0.2), y: b.y - (abDiff.y * 0.2) };
    
    const efDiff = { x: Math.abs(e.x - f.x), y: Math.abs(e.y - f.y) };
    
    path.quadraticCurveTo(e.x + (efDiff.x * 0.9), e.y + (efDiff.y * 0.25), f.x, f.y);
    
    const g = { x: c.x - (cdDiff.x * 0.2), y: c.y - (cdDiff.y * 0.2) };
    
    path.moveTo(g.x, g.y);
    
    const h = { x: d.x + (cdDiff.x * 0.45), y: d.y + (cdDiff.y * 0.5) };
    
    const ghDiff = { x: Math.abs(g.x - h.x), y: Math.abs(g.y - h.y) };
    
    path.quadraticCurveTo(g.x - (ghDiff.x * 0.6), g.y - (ghDiff.y * 0.25), h.x, h.y);
    
    return path;
  },
  check: (balloon, now) => {
    const visible = now - balloon.createdAt <= balloon.duration,
          unpopped = balloon.poppedAt === null || now - balloon.poppedAt <= State.params.duration.fast;
    
    return visible && unpopped;
  },
  color: (balloon, opacity) => {
    const alpha = balloon.poppedAt
      ? Animate.onclick(opacity * 100, 0, "fast") / 100
      : opacity;
    
    return Mapper.rgba(balloon.color, alpha);
  },
  draw: balloon => {
    const { context, timestamps } = State,
          { height, width } = State.context.canvas;
    
    const { color, position } = balloon;
    
    const size = Balloon.size(balloon);
    
    context.lineWidth = size.thickness;
    context.strokeStyle = Balloon.color(balloon, 1);
    context.fillStyle = Balloon.color(balloon, 0.1);
    context.lineCap = "round";
    
    const body = Balloon.body(size, position),
          knot = Balloon.knot(size, position),
          tail = Balloon.tail(size, position);
    
    if(Canvas.in(body) || Canvas.in(knot)) {
      context.fillStyle = Balloon.color(balloon, 0.25);
      
      const now = new Date().getTime();
      
      if(now - timestamps.clickAt <= 20) {
        Balloon.pop(balloon, now);
      }
    }

    context.stroke(body);    
    context.fill(body);
    
    context.stroke(knot);    
    context.fill(knot);
    
    context.stroke(tail);   
  },
  filter: () => {
    const now = new Date().getTime();
    
    return State.balloons.filter(balloon => Balloon.check(balloon, now));
  },
  generate: () => {
    const { colors } = State,
          { frequency } = State.params.balloon;
          
    const color = State.colors[State.index++ % colors.length];
    
    State.balloons.push(Mapper.balloon(color));
    
    setTimeout(() => requestAnimationFrame(Balloon.generate), frequency);
  },
  knot: (size, position) => {   
    const { context } = State,
          { height, base } = size;
    
    const path = new Path2D();
    
    const a1 = { x: position.x, y: position.y + (height * 0.5) };
    
    const a2 = { x: a1.x + (base * 20), y: a1.y + (base * 10) },
          a3 = { x: a1.x - (base * 20), y: a1.y + (base * 10) };
    
    path.moveTo(a1.x, a1.y);
    
    path.bezierCurveTo(a2.x, a2.y, a3.x, a3.y, a1.x, a1.y);
    
    return path;
  },
  pop: (balloon, poppedAt) => {
    Splatter.generate(balloon.color);
    
    State.timestamps.popAt = poppedAt;
    
    State.balloons = State.balloons.map(b => {
      if(b.id === balloon.id && b.poppedAt === null) {
        b.poppedAt = poppedAt;
      }
      
      return b;
    });
  },
  release: () => {
    const { height, width } = State.context.canvas,
          { balloon: params } = State.params; 
    
    State.balloons = Balloon.filter();
    
    for(let balloon of State.balloons) {
      const y = Animate.value(balloon.position.y, params.size * 100 * -1, balloon.duration, balloon.createdAt);
      
      const position = { ...balloon.position, y };
      
      Balloon.draw({ ...balloon, position });
    }
  },
  size: balloon => {
    const size = { base: State.params.balloon.size };
    
    if(balloon && balloon.poppedAt) {
      size.base = size.base * (Animate.onclick(100, 150, "fast") / 100);
    }
    
    const height = size.base * 100;
    
    size.height = height;
    size.width = height * 0.8;
    size.thickness = size.base * 1.2
    
    
    return size;
  },
  tail: (size, position) => {
    const { height, base } = size;
    
    const path = new Path2D();
    
    const a = { x: position.x, y: position.y + (height * 0.5) + (base * 8) };
    
    path.moveTo(a.x, a.y);
    
    const b = { x: a.x, y: a.y + (base * 30) };
    
    const abDiff = { x: Math.abs(a.x - b.x), y: Math.abs(a.y - b.y) };
    
    path.bezierCurveTo(a.x - (base * 6), a.y + (base * 12), b.x + (base * 12), b.y - (base * 10), b.x, b.y);
    
    return path;
  }
}

const App = {
  draw: () => {
    Canvas.draw();
    
    Balloon.release();
    
    Reticle.draw();
    
    Splatter.draw();
    
    window.requestAnimationFrame(App.draw);
  }
}

window.onload = () => {  
  State.context = document.getElementById("canvas").getContext("2d");
  
  App.draw();
  
  Balloon.generate();
  
  State.position = Mapper.position(State.context.canvas.width / 2, State.context.canvas.height / 2);
}

window.onmousemove = e => {
  State.position.x = e.clientX;
  State.position.y = e.clientY;
}

window.onmousedown = () => {
  State.timestamps.clickAt = new Date().getTime();
}