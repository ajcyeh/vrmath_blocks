// https://developers.google.com/blockly/reference/js/Blockly.Block

var workspace = null;
var anyType = ['Array', 'List', 'String', 'Character', 'Integer', 'Real', 'Boolean'];

var expressionColor = 270;
var statementColor = 180;

function generateStatement(id, args = [], isPrefixedById = true, arity) {
  if (id == 'geometry') console.log(isPrefixedById);
  return generateBlock(id, statementColor, null, args, isPrefixedById, arity);
}

function generateExpression(id, returnType, args = [], isPrefixedById = true, arity) {
  return generateBlock(id, expressionColor, returnType, args, isPrefixedById, arity);
}

function generateBlock(id, color, returnType, args, isPrefixedById, arity) {
  if (arity) {
    args = [];
    for (var i = 0; i < arity.count; ++i) {
      args.push({ id: 'element' + i, type: arity.type });
    }
  }

  var inputs = args.map(arg => {
    var object;
    if (arg.id) {
      object = {
        align: 'RIGHT',
        name: arg.id,
      };
      if (arg.options) {
        object.type = 'field_dropdown';
        object.options = arg.options;
      } else {
        object.type = 'input_value';
        object.check = arg.type;
      }
    } else {
      object = {
        type: 'input_dummy',
        name: arg.label,
      };
    }
    return object;
  });

  var tokens = [];
  if (id) {
    tokens.push(id);
  }
  args.forEach((arg, i) => {
    if (arg.label) {
      tokens.push(arg.label);
    }
    tokens.push('%' + (i + 1));
  });
  var message0 = tokens.join(' ');

  var configuration = {
    colour: color,
    message0: message0,
    args0: inputs,
  };

  var assemble = null;
  if (returnType) {
    configuration.output = returnType;
    assemble = function(code) {
      return [code, Blockly.VRMath.ORDER_FUNCTION_CALL];
    }
  } else {
    configuration.previousStatement = null;
    configuration.nextStatement = null;
    assemble = function(code) {
      return code + '\n';
    }
  }

  var block = {
    configuration: configuration,
    generator: function(block) {
      var tokens = [];
      if (isPrefixedById) {
        tokens.push(id);
      }
      args.forEach(arg => {
        if (arg.options) {
          tokens.push(block.getFieldValue(arg.id));
        } else {
          tokens.push(Blockly.VRMath.valueToCode(block, arg.id, Blockly.VRMath.ORDER_FUNCTION_CALL));
        }
      });
      return assemble(tokens.join(' '));
    }
  };

  if (arity) {
    block.configuration.mutator = 'setArity';
    block.configuration.extensions = ['addArityMenuItem'];
    block.vrmath = {
      arity: arity.count,
      elementType: arity.type,
    };
    block.generator = function(block) {
      var tokens = [];
      if (isPrefixedById) {
        tokens.push(id);
      }
      for (var i = 0; i < block.vrmath.arity; ++i) {
        tokens.push(Blockly.VRMath.valueToCode(block, 'element' + i, Blockly.VRMath.ORDER_COLLECTION));
      }
      return assemble(tokens.join(' '));
    }
  } else {
    block.generator = function(block) {
      var tokens = [];
      if (isPrefixedById) {
        tokens.push(id);
      }
      args.forEach(arg => {
        if (arg.options) {
          tokens.push(block.getFieldValue(arg.id));
        } else {
          tokens.push(Blockly.VRMath.valueToCode(block, arg.id, Blockly.VRMath.ORDER_FUNCTION_CALL));
        }
      });
      return assemble(tokens.join(' '));
    }
  }

  return block;
}

var blockDefinitions = {
  // Primitives
  integer: {
    configuration: {
      colour: expressionColor,
      output: 'Integer',
      message0: '%1',
      args0: [
        {
          type: 'field_input',
          name: 'value',
          text: '0'
        },
      ]
    },
    generator: function(block) {
      var code = block.getFieldValue('value');
      return [code, Blockly.VRMath.ORDER_ATOMIC];
    }
  },
  real: {
    configuration: {
      colour: expressionColor,
      output: 'Real',
      message0: '%1',
      args0: [
        { 
          type: 'field_input',
          name: 'value',
          text: '0.0'
        },
      ]
    },
    generator: function(block) {
      var code = block.getFieldValue('value');
      return [code, Blockly.VRMath.ORDER_ATOMIC];
    }
  },
  boolean: {
    configuration: {
      colour: expressionColor,
      output: 'Boolean',
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'value',
          options: [
            ['true', 'true'],
            ['false', 'false'],
          ]
        },
      ]
    },
    generator: function(block) {
      var code = block.getFieldValue('value') == 'true';
      return [code, Blockly.VRMath.ORDER_ATOMIC];
    }
  },
  string: {
    configuration: {
      colour: expressionColor,
      output: 'String',
      message0: '%1',
      args0: [
        { 
          type: 'field_input',
          name: 'value',
          text: 'string'
        },
      ]
    },
    generator: function(block) {
      var code = '"' + block.getFieldValue('value');
      return [code, Blockly.VRMath.ORDER_ATOMIC];
    }
  },
  gensym: generateExpression('gensym', 'String'),

  // Lists and arrays
  word: generateExpression('word', 'String', [], true, { count: 1, type: 'String' }),
  list: generateExpression('list', 'List', [], true, { count: 2, type: anyType }),
  sentence: generateExpression('sentence', 'List', [], true, { count: 2, type: anyType }),
  array: generateExpression('array', 'Array', [
    { id: 'size', type: 'Integer' },
  ]),
  listtoarray: generateExpression('listtoarray', 'Array', [
    { id: 'list', type: 'List' },
  ]),
  arraytolist: generateExpression('arraytolist', 'List', [
    { id: 'array', type: 'Array' },
  ]),
  reverse: generateExpression('reverse', 'List', [
    { id: 'list', type: 'List' },
  ]),
  fput: generateExpression('fput', 'List', [
    { id: 'thing', label: 'thing', type: null },
    { id: 'list', label: 'list', type: 'List' },
  ]),
  lput: generateExpression('lput', 'List', [
    { id: 'thing', label: 'thing', type: null },
    { id: 'list', label: 'list', type: 'List' },
  ]),
  combine: generateExpression('combine', ['String', 'List'], [
    { id: 'thingA', type: null },
    { id: 'thingB', type: ['String', 'List'] },
  ]),
  first: generateExpression('first', 'List', [
    { id: 'list', type: 'List' },
  ]),
  last: generateExpression('last', 'List', [
    { id: 'list', type: 'List' },
  ]),
  butfirst: generateExpression('butfirst', 'List', [
    { id: 'list', type: 'List' },
  ]),
  butlast: generateExpression('butlast', 'List', [
    { id: 'list', type: 'List' },
  ]),
  firsts: generateExpression('firsts', 'List', [
    { id: 'list', type: 'List' },
  ]),
  butfirsts: generateExpression('butfirsts', 'List', [
    { id: 'list', type: 'List' },
  ]),
  pick: generateExpression('pick', anyType, [
    { id: 'list', type: 'List' },
  ]),
  item: generateExpression('item', anyType, [
    { id: 'index', label: 'index', type: 'Integer' },
    { id: 'thing', label: 'thing', type: ['Array', 'List'] },
  ]),
  setitem: generateStatement('setitem', [
    { id: 'index', label: 'index', type: 'Integer' },
    { id: 'array', label: 'array', type: 'Array' },
    { id: 'value', label: 'value', type: anyType },
  ]),
  remove: generateExpression('remove', 'List', [
    { id: 'thing', label: 'thing', type: anyType },
    { id: 'list', label: 'list', type: 'List' },
  ]),
  remdup: generateExpression('remdup', 'List', [
    { id: 'list', label: 'list', type: 'List' },
  ]),
  push: generateStatement('push', [
    { id: 'stack', label: 'stack', type: 'List' },
    { id: 'thing', label: 'thing', type: anyType },
  ]),
  queue: generateStatement('queue', [
    { id: 'stack', label: 'stack', type: 'List' },
    { id: 'thing', label: 'thing', type: anyType },
  ]),
  pop: generateStatement('pop', [
    { id: 'stack', label: 'stack', type: 'List' },
  ]),
  dequeue: generateStatement('dequeue', [
    { id: 'stack', label: 'stack', type: 'List' },
  ]),

  // Predicates
  isword: generateExpression('word?', 'Boolean', [
    { id: 'thing', type: anyType },
  ]),
  islist: generateExpression('list?', 'Boolean', [
    { id: 'thing', type: anyType },
  ]),
  isarray: generateExpression('array?', 'Boolean', [
    { id: 'thing', type: anyType },
  ]),
  isnumber: generateExpression('number?', 'Boolean', [
    { id: 'thing', type: anyType },
  ]),
  isequal: generateExpression('equal?', 'Boolean', [
    { id: 'thingA', type: anyType },
    { id: 'thingB', type: anyType },
  ]),
  isnotequal: generateExpression('notequal?', 'Boolean', [
    { id: 'thingA', type: anyType },
    { id: 'thingB', type: anyType },
  ]),
  isempty: generateExpression('empty?', 'Boolean', [
    { id: 'thing', type: ['String', 'List'] },
  ]),
  isbefore: generateExpression('before?', 'Boolean', [
    { id: 'thingA', type: 'String' },
    { id: 'thingB', type: 'String' },
  ]),
  ismember: generateExpression('member?', 'Boolean', [
    { id: 'thing', label: 'thing', type: anyType },
    { id: 'list', label: 'list', type: 'List' },
  ]),
  issubstring: generateExpression('substring?', 'Boolean', [
    { id: 'thingA', type: 'String' },
    { id: 'thingB', type: 'String' },
  ]),

  // Queries
  count: generateExpression('count', 'Integer', [
    { id: 'thing', type: ['String', 'List'] },
  ]),
  ord: generateExpression('ascii', 'String', [
    { id: 'thing', type: 'Integer' },
  ]),
  chr: generateExpression('char', 'String', [
    { id: 'thing', type: 'Character' },
  ]),
  uppercase: generateExpression('uppercase', 'String', [
    { id: 'thing', type: 'String' },
  ]),
  lowercase: generateExpression('lowercase', 'String', [
    { id: 'thing', type: 'String' },
  ]),

  // Commands
  jumpdirection: generateStatement('jump', [
    { id: 'direction',
      options: [
        ['forward', 'jumpforward'],
        ['back', 'jumpback'],
        ['east', 'jumpeast'],
        ['west', 'jumpwest'],
        ['north', 'jumpnorth'],
        ['south', 'jumpsouth'],
        ['up', 'jumpup'],
        ['down', 'jumpdown'],
      ],
    },
    { id: 'value', type: ['Integer', 'Real'], },
  ], false),
  move: generateStatement('move', [
    { id: 'direction',
      options: [
        ['forward', 'forward'],
        ['back', 'back'],
        ['east', 'east'],
        ['west', 'west'],
        ['north', 'north'],
        ['south', 'south'],
        ['up', 'up'],
        ['down', 'down'],
      ],
    },
    { id: 'distance', type: ['Integer', 'Real'], },
  ], false),
  setpos: generateStatement('setpos', [
    { id: 'position', type: 'List' }
  ]),
  setxyz: generateStatement('setxyz', [
    { id: 'x', label: 'x', type: ['Integer', 'Real'], },
    { id: 'y', label: 'y', type: ['Integer', 'Real'], },
    { id: 'z', label: 'z', type: ['Integer', 'Real'], },
  ]),
  jumpdimension: generateStatement('jump', [
    { id: 'dimension',
      options: [
        ['x', 'jumpx'],
        ['y', 'jumpy'],
        ['z', 'jumpz'],
      ],
    },
    { id: 'value', type: ['Integer', 'Real'], },
  ], false),
  setdimension: generateStatement('set', [
    { id: 'dimension',
      options: [
        ['x', 'setx'],
        ['y', 'sety'],
        ['z', 'setz'],
      ],
    },
    { id: 'value', type: ['Integer', 'Real'], },
  ], false),
  home: generateStatement('home'),
  jump: generateStatement('jump'),
  jumpon: generateStatement('jumpon'),
  jumpoff: generateStatement('jumpoff'),
  turn: generateStatement('turn', [
    { id: 'direction',
      options: [
        ['left', 'left'],
        ['right', 'right'],
        ['rollup', 'rollup'],
        ['rolldown', 'rolldown'],
        ['tiltleft', 'tiltleft'],
        ['tiltright', 'tiltright'],
      ],
    },
    { id: 'angle', type: ['Integer', 'Real'], },
  ], false),
  jumppos: generateStatement('jumppos', [
    { id: 'position', type: 'List' },
  ]),
  lookatpos: generateStatement('lookatpos', [
    { id: 'position', type: 'List' },
  ]),
  jumpxyz: generateStatement('jumpxyz', [
    { id: 'x', type: ['Integer', 'Real'], },
    { id: 'y', type: ['Integer', 'Real'], },
    { id: 'z', type: ['Integer', 'Real'], },
  ]),
  lookatxyz: generateStatement('lookatxyz', [
    { id: 'x', type: ['Integer', 'Real'], },
    { id: 'y', type: ['Integer', 'Real'], },
    { id: 'z', type: ['Integer', 'Real'], },
  ]),
  setheading: generateStatement('setheading', [
    { id: 'angle', type: ['Integer', 'Real'], },
  ]),
  print: generateStatement('print', [], true, { count: 1, type: anyType }),
  type: generateStatement('type', [], true, { count: 1, type: anyType }),
  show: generateStatement('show', [], true, { count: 1, type: anyType }),
  cleartext: generateStatement('cleartext'),

  // Turtle Queries
  position: generateExpression('position', 'List'),
  getd: generateExpression('get', 'Real', [
    { id: 'dimension',
      options: [
        ['x', 'getx'],
        ['y', 'gety'],
        ['z', 'getz'],
      ],
    },
  ], false),
  heading: generateExpression('heading', 'Real'),
  meter: generateStatement('meter'),
  centimeter: generateStatement('centimeter'),
  setturtle: generateStatement('setturtle', [
    { id: 'id', type: 'Object' },
  ]),
  showturtle: generateStatement('showturtle'),
  hideturtle: generateStatement('hideturtle'),
  clean: generateStatement('clean'),
  clearscreen: generateStatement('clearscreen'),
  isshown: generateExpression('shown?', 'Boolean'),
  distanceto: generateExpression('distanceto', 'Real', [
    { id: 'distanceto', type: 'List' },
  ]),
  distancetoxyz: generateExpression('distancetoxyz', 'Real', [
    { id: 'x', type: ['Integer', 'Real'], },
    { id: 'y', type: ['Integer', 'Real'], },
    { id: 'z', type: ['Integer', 'Real'], },
  ]),
  distancebetween: generateExpression('distancebetween', 'Real', [
    { id: 'a', type: 'List' },
    { id: 'b', type: 'List' },
  ]),
  turtle: generateExpression('turtle', 'Object'),

  // Pen and Background
  geometry: generateStatement(null, [
    { id: 'mode',
      options: [
        ['point', 'point'],
        ['line', 'line'],
        ['face', 'face'],
      ],
    },
  ], false),
  pen: generateStatement('pen', [
    { id: 'mode',
      options: [
        ['up', 'penup'],
        ['down', 'pendown'],
      ],
    },
  ], false),
  nextcolor: generateStatement('nextcolor'),
  nextcoloron: generateStatement('nextcolor', [
    { id: 'mode',
      options: [
        ['on', 'nextcoloron'],
        ['off', 'nextcoloroff'],
      ],
    },
  ], false),
  setbackground: generateStatement('setbackground', [
    { id: 'index', type: 'Integer' },
  ]),
  pencolor: generateStatement('pencolor', [
    { id: 'mode',
      options: [
        ['on', 'pencoloron'],
        ['off', 'pencoloroff'],
      ],
    },
  ], false),
  setpcname: generateStatement('setpcname', [
    { id: 'color', type: 'String' },
  ]),
  setpencolor: generateStatement('setpencolor', [
    { id: 'red',   type: ['Integer', 'Real'], label: 'red' },
    { id: 'green', type: ['Integer', 'Real'], label: 'green' },
    { id: 'blue',  type: ['Integer', 'Real'], label: 'blue' },
  ]),
  setcolord: generateStatement('set', [
    { id: 'channel',
      options: [
        ['red', 'setr'],
        ['green', 'setg'],
        ['blue', 'setb'],
      ],
    },
    { id: 'value', type: ['Integer', 'Real'] },
  ], false),

  // Pen Queries
  ispen: generateExpression('pen', 'Boolean', [
    { id: 'mode',
      options: [
        ['up', 'up'],
        ['down', 'down'],
      ],
    },
    { label: '?' },
  ]),
  penmode: generateExpression('penmode', 'String'),
  getpencolor: generateExpression('pencolor', 'String'),
  getcolor: generateExpression('color', 'String'),

  // Primitives
  box: generateStatement('box'),
  cylinder: generateStatement('cylinder'),
  cone: generateStatement('cone'),
  sphere: generateStatement('sphere'),
  torus: generateStatement('torus'),
  snout: generateStatement('snout'),
  dish: generateStatement('dish'),
  pyramid: generateStatement('pyramid'),
  rectangulartorus: generateStatement('rectangulartorus'),
  slopedcylinder: generateStatement('slopedcylinder'),
  nozzle: generateStatement('nozzle'),
  elevationgrid: generateStatement('elevationgrid'),
  extrusion: generateStatement('extrusion'),
  arc: generateStatement('arc'),
  pie: generateStatement('pie'),
  circle: generateStatement('circle'),
  disk: generateStatement('disk'),
  rectangle: generateStatement('rectangle'),
  world: generateStatement('world', [
    { id: 'url', type: 'String' },
  ]),
  picture: generateStatement('picture', [
    { id: 'url', type: 'String' },
  ]),
  video: generateStatement('video', [
    { id: 'url', type: 'String' },
  ]),
  sound: generateStatement('sound', [
    { id: 'url', type: 'String', label: 'url', },
    { id: 'enabled', type: 'Boolean', label: 'enabled' },
    { id: 'loop', type: 'Boolean', label: 'loop' },
  ]),
  pointlight: generateStatement('pointlight'),
  directionallight: generateStatement('directionallight'),
  spotlight: generateStatement('spotlight'),
  transform: generateStatement('transform'),
  label: generateStatement('label', [
    { id: 'text', type: ['String', 'Label'] },
  ]),
  viewpoint: generateStatement('viewpoint'),

  // Numeric Operations
  binaryarithmetic: {
    configuration: {
      colour: expressionColor,
      output: ['Integer', 'Real'],
      inputsInline: true,
      message0: '%1 %2 %3',
      args0: [
        {
          type: 'input_value',
          name: 'a',
          check: ['Integer', 'Real'],
        },
        {
          type: 'field_dropdown',
          name: 'operator',
          options: [
            ['+', '+'],
            ['-', '-'],
            ['*', '*'],
            ['/', '/'],
            ['^', '^'],
            ['%', '%'],
          ]
        },
        {
          type: 'input_value',
          name: 'b',
          check: ['Integer', 'Real'],
        },
      ]
    },
    generator: function(block) {
      var operator = block.getFieldValue('operator');
      if (operator == '+' || operator == '-') {
        precedence = Blockly.VRMath.ORDER_ADDITIVE;
      } else if (operator == '*' || operator == '/' || operator == '%') {
        precedence = Blockly.VRMath.ORDER_MULTIPLICATIVE;
      } else if (operator == '^') {
        precedence = Blockly.VRMath.ORDER_EXPONENTIATION;
      } else {
        throw 'Bad operator: ' + operator;
      }

      var codeA = Blockly.VRMath.valueToCode(block, 'a', precedence);
      var codeB = Blockly.VRMath.valueToCode(block, 'b', precedence);
      var code = codeA + ' ' + operator + ' ' + codeB;
      
      return [code, precedence];
    }
  },
  unaryarithmetic: {
    configuration: {
      colour: expressionColor,
      output: ['Integer', 'Real'],
      inputsInline: true,
      message0: '- %1',
      args0: [
        {
          type: 'input_value',
          name: 'a',
          check: ['Integer', 'Real'],
        },
      ]
    },
    generator: function(block) {
      var codeA = Blockly.VRMath.valueToCode(block, 'a', Blockly.VRMath.ORDER_UNARY_SIGN);
      var code = '-' + codeA;
      return [code, Blockly.VRMath.ORDER_UNARY_SIGN];
    }
  },
  abs: generateExpression('abs', ['Integer', 'Real'], [
    { id: 'value', type: ['Integer', 'Real'], },
  ]),
  int: generateExpression('int', 'Integer', [
    { id: 'value', type: ['Integer', 'Real'], },
  ]),
  round: generateExpression('round', 'Integer', [
    { id: 'value', type: ['Integer', 'Real'], },
  ]),
  sqrt: generateExpression('sqrt', 'Real', [
    { id: 'value', type: ['Integer', 'Real'], },
  ]),
  exp: generateExpression('exp', 'Real', [
    { id: 'value', type: ['Integer', 'Real'], },
  ]),
  log10: generateExpression('log10', 'Real', [
    { id: 'value', type: ['Integer', 'Real'], },
  ]),
  ln: generateExpression('ln', 'Real', [
    { id: 'value', type: ['Integer', 'Real'], },
  ]),
  sincostandegrees: generateExpression(null, 'Real', [
    { id: 'operation',
      options: [
        ['sin', 'sin'],
        ['cos', 'cos'],
        ['tan', 'tan'],
      ],
    },
    { id: 'value', type: ['Integer', 'Real'], },
  ], false),
  sincostanradians: generateExpression(null, 'Real', [
    { id: 'operation',
      options: [
        ['radsin', 'radsin'],
        ['radcos', 'radcos'],
        ['radtan', 'radtan'],
      ],
    },
    { id: 'value', type: ['Integer', 'Real'], },
  ], false),
  arctandegrees1: generateExpression('arctan', 'Real', [
    { id: 'value', type: ['Integer', 'Real'], },
  ]),
  arctandegrees2: generateExpression('arctan', 'Real', [
    { id: 'x', type: ['Integer', 'Real'], label: 'x' },
    { id: 'y', type: ['Integer', 'Real'], label: 'y' },
  ]),
  arctanradians1: generateExpression('radarctan', 'Real', [
    { id: 'value', type: ['Integer', 'Real'], },
  ]),
  arctanradians2: generateExpression('radarctan', 'Real', [
    { id: 'x', type: ['Integer', 'Real'], label: 'x' },
    { id: 'y', type: ['Integer', 'Real'], label: 'y' },
  ]),
  iseq: generateExpression('iseq', 'List', [
    { id: 'first', type: 'Integer', label: 'first' },
    { id: 'last', type: 'Integer', label: 'last' },
  ]),
  rseq: generateExpression('rseq', 'List', [ // TODO: count?
    { id: 'first', type: 'Integer', label: 'first' },
    { id: 'last', type: 'Integer', label: 'last' },
    { id: 'count', type: 'Integer', label: 'count' },
  ]),
};

function initializeBlock(id) {
  Blockly.Blocks[id] = {
    init: function() {
      this.jsonInit(blockDefinitions[id].configuration);
      if (blockDefinitions[id].hasOwnProperty('vrmath')) {
        // Warning! The vrmath object must only consist of primitives, not
        // collections or compound objects.
        this.vrmath = Object.assign({}, blockDefinitions[id].vrmath);
      }
    }
  };
  Blockly.VRMath[id] = blockDefinitions[id].generator;
}

function triggerArity(block, arity) {
  var oldMutation = block.mutationToDom();
  block.vrmath.arity = arity;
  var newMutation = block.mutationToDom();
  block.domToMutation(newMutation);
  var event = new Blockly.Events.BlockChange(block, 'mutation', null, Blockly.Xml.domToText(oldMutation), Blockly.Xml.domToText(newMutation));
  Blockly.Events.fire(event);
}

function setup() {
  // Initialize blocks.
  for (var id in blockDefinitions) {
    if (blockDefinitions.hasOwnProperty(id)) {
      initializeBlock(id);
    }
  }

  Blockly.Extensions.register('addArityMenuItem', function() {
    var block = this;
    this.mixin({
      customContextMenu: function(options) {
        var option = {
          enabled: true,
          text: 'Change size...',
          callback: function() {
            var size = prompt("How many elements are in the array?");
            if (new RegExp(/^\d+/).test(size)) {
              triggerArity(block, parseInt(size));
            }
          }
        };
        options.push(option);
      }
    });
  });

  Blockly.Extensions.registerMutator('setArity', {
    mutationToDom: function() {
      var container = document.createElement('mutation');
      container.setAttribute('arity', this.vrmath.arity);
      return container;
    },
    domToMutation: function(xml) {
      var expectedArity = xml.getAttribute('arity');
      var actualArity = this.getInput('empty') ? 0 : this.inputList.length;
      this.vrmath.arity = expectedArity;

      if (expectedArity > 0 && actualArity == 0) {
        this.removeInput('empty');
      } else if (expectedArity == 0 && actualArity > 0) {
        this.appendDummyInput('empty')
            .appendField(this.type);
      }

      // Currently there are more than we need. Trim off extras.
      if (actualArity > expectedArity) {
        for (var i = actualArity - 1; i >= expectedArity; --i) {
          this.removeInput('element' + i);
        }
      }
      
      // Currently there are fewer than we need. Add missing.
      else if (actualArity < expectedArity) {
        for (var i = actualArity; i < expectedArity; ++i) {
          var input = this.appendValueInput('element' + i, );
          if (i == 0) {
            input.appendField(this.type);
          }
          if (this.vrmath.elementType) {
            input.setCheck(this.vrmath.elementType);
          }
        }
      }
    }
  });

  var options = {
    toolbox: document.getElementById('toolbox'),
    trashcan: true,
    comments: false,
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2
    }
  };
  workspace = Blockly.inject('blocklyEditor', options);

  $('#generateButton').click(function() {
    var dom = Blockly.Xml.workspaceToDom(workspace);
    var xml = Blockly.Xml.domToPrettyText(dom);
    localStorage.setItem('vrmath', xml);

    var code = Blockly.VRMath.workspaceToCode(workspace);
    $('#generatedSource').text(code);
    // console.log(code);
  });

  if (localStorage.getItem('vrmath') != null) {
    var xml = localStorage.getItem('vrmath');
    var dom = Blockly.Xml.textToDom(xml);
    Blockly.Xml.domToWorkspace(dom, workspace);
  }
}

$(document).ready(setup);
