// https://developers.google.com/blockly/reference/js/Blockly.Block

var workspace = null;
var allTypes = ['Array', 'List', 'String', 'Integer', 'Real', 'Boolean'];

var expressionColor = 270;
var statementColor = 180;

function generateStatement(id, args = [], isPrefixedById = true) {
  return generateBlock(id, statementColor, null, args, isPrefixedById);
}

function generateExpression(id, returnType, args = [], isPrefixedById = true) {
  return generateBlock(id, expressionColor, returnType, args, isPrefixedById);
}

function generateBlock(id, color, returnType, args, isPrefixedById) {
  var inputs = args.map(arg => {
    var object = {
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
    return object;
  });

  var tokens = [id];
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

  return {
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
  word: {
    configuration: {
      colour: expressionColor,
      output: 'String',
      message0: 'word %1 %2',
      mutator: 'setArity',
      extensions: [
        'addArityMenuItem',
      ],
      args0: [
        { 
          type: 'input_value',
          check: 'String',
          name: 'element0',
        },
        { 
          type: 'input_value',
          check: 'String',
          name: 'element1',
        },
      ]
    },
    vrmath: {
      arity: 2,
      elementType: 'String',
    },
    generator: function(block) {
      var tokens = ['word'];
      for (var i = 0; i < block.vrmath.arity; ++i) {
        tokens.push(Blockly.VRMath.valueToCode(block, 'element' + i, Blockly.VRMath.ORDER_COLLECTION));
      }
      return [tokens.join(' '), Blockly.VRMath.ORDER_NONE];
    }
  },
  list: {
    configuration: {
      colour: expressionColor,
      output: 'List',
      message0: 'list %1 %2',
      mutator: 'setArity',
      extensions: [
        'addArityMenuItem',
      ],
      args0: [
        { 
          type: 'input_value',
          name: 'element0',
        },
        { 
          type: 'input_value',
          name: 'element1',
        },
      ]
    },
    vrmath: {
      arity: 2
    },
    generator: function(block) {
      var tokens = ['list'];
      for (var i = 0; i < block.vrmath.arity; ++i) {
        tokens.push(Blockly.VRMath.valueToCode(block, 'element' + i, Blockly.VRMath.ORDER_COLLECTION));
      }
      return [tokens.join(' '), Blockly.VRMath.ORDER_NONE];
    }
  },
  sentence: {
    configuration: {
      colour: expressionColor,
      output: 'List',
      message0: 'sentence %1 %2',
      mutator: 'setArity',
      extensions: [
        'addArityMenuItem',
      ],
      args0: [
        { 
          type: 'input_value',
          name: 'element0',
        },
        { 
          type: 'input_value',
          name: 'element1',
        },
      ]
    },
    vrmath: {
      arity: 2
    },
    generator: function(block) {
      var tokens = ['sentence'];
      for (var i = 0; i < block.vrmath.arity; ++i) {
        tokens.push(Blockly.VRMath.valueToCode(block, 'element' + i, Blockly.VRMath.ORDER_COLLECTION));
      }
      return [tokens.join(' '), Blockly.VRMath.ORDER_NONE];
    }
  },
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
  pick: generateExpression('pick', allTypes, [
    { id: 'list', type: 'List' },
  ]),
  item: generateExpression('item', allTypes, [
    { id: 'index', label: 'index', type: 'Integer' },
    { id: 'thing', label: 'thing', type: ['Array', 'List'] },
  ]),
  setitem: generateStatement('setitem', [
    { id: 'index', label: 'index', type: 'Integer' },
    { id: 'array', label: 'array', type: 'Array' },
    { id: 'value', label: 'value', type: allTypes },
  ]),
  remove: generateExpression('remove', 'List', [
    { id: 'thing', label: 'thing', type: allTypes },
    { id: 'list', label: 'list', type: 'List' },
  ]),
  remdup: generateExpression('remdup', 'List', [
    { id: 'list', label: 'list', type: 'List' },
  ]),
  push: generateStatement('push', [
    { id: 'stack', label: 'stack', type: 'List' },
    { id: 'thing', label: 'thing', type: allTypes },
  ]),
  queue: generateStatement('queue', [
    { id: 'stack', label: 'stack', type: 'List' },
    { id: 'thing', label: 'thing', type: allTypes },
  ]),
  pop: generateStatement('pop', [
    { id: 'stack', label: 'stack', type: 'List' },
  ]),
  dequeue: generateStatement('dequeue', [
    { id: 'stack', label: 'stack', type: 'List' },
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
  print: generateStatement('print', [
    { id: 'value', type: null, },
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
    console.log(code);
  });

  if (localStorage.getItem('vrmath') != null) {
    var xml = localStorage.getItem('vrmath');
    var dom = Blockly.Xml.textToDom(xml);
    Blockly.Xml.domToWorkspace(dom, workspace);
  }
}

$(document).ready(setup);
