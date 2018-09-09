// https://developers.google.com/blockly/reference/js/Blockly.Block

var workspace = null;

var expressionColor = 270;
var statementColor = 180;

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
  gensym: {
    configuration: {
      colour: expressionColor,
      output: 'String',
      message0: 'gensym',
    },
    generator: function(block) {
      var code = 'gensym';
      return [code, Blockly.VRMath.ORDER_ATOMIC];
    }
  },

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
  array: {
    configuration: {
      colour: expressionColor,
      output: 'Array',
      message0: 'array %1',
      args0: [
        { 
          type: 'input_value',
          check: 'Integer',
          name: 'size',
        },
      ]
    },
    generator: function(block) {
      var tokens = ['array'];
      tokens.push(Blockly.VRMath.valueToCode(block, 'size', Blockly.VRMath.ORDER_ATOMIC));
      return [tokens.join(' '), Blockly.VRMath.ORDER_NONE];
    }
  },
  listtoarray: {
    configuration: {
      colour: expressionColor,
      output: 'Array',
      message0: 'listtoarray %1',
      args0: [
        { 
          type: 'input_value',
          check: 'List',
          name: 'list',
        },
      ]
    },
    generator: function(block) {
      var tokens = ['listtoarray'];
      tokens.push(Blockly.VRMath.valueToCode(block, 'list', Blockly.VRMath.ORDER_ATOMIC));
      return [tokens.join(' '), Blockly.VRMath.ORDER_NONE];
    }
  },
  arraytolist: {
    configuration: {
      colour: expressionColor,
      output: 'List',
      message0: 'arraytolist %1',
      args0: [
        { 
          type: 'input_value',
          check: 'Array',
          name: 'array',
        },
      ]
    },
    generator: function(block) {
      var tokens = ['arraytolist'];
      tokens.push(Blockly.VRMath.valueToCode(block, 'array', Blockly.VRMath.ORDER_ATOMIC));
      return [tokens.join(' '), Blockly.VRMath.ORDER_NONE];
    }
  },
  reverse: {
    configuration: {
      colour: expressionColor,
      output: 'List',
      message0: 'reverse %1',
      args0: [
        { 
          type: 'input_value',
          check: 'List',
          name: 'list',
        },
      ]
    },
    generator: function(block) {
      var tokens = ['reverse'];
      tokens.push(Blockly.VRMath.valueToCode(block, 'list', Blockly.VRMath.ORDER_ATOMIC));
      return [tokens.join(' '), Blockly.VRMath.ORDER_NONE];
    }
  },
  fput: {
    configuration: {
      colour: expressionColor,
      output: 'List',
      message0: 'fput thing %1 list %2',
      args0: [
        { 
          type: 'input_value',
          align: 'RIGHT',
          name: 'thing',
        },
        { 
          type: 'input_value',
          align: 'RIGHT',
          check: 'List',
          name: 'list',
        },
      ]
    },
    generator: function(block) {
      var tokens = ['fput'];
      tokens.push(Blockly.VRMath.valueToCode(block, 'thing', Blockly.VRMath.ORDER_ATOMIC));
      tokens.push(Blockly.VRMath.valueToCode(block, 'list', Blockly.VRMath.ORDER_ATOMIC));
      return [tokens.join(' '), Blockly.VRMath.ORDER_NONE];
    }
  },
  lput: {
    configuration: {
      colour: expressionColor,
      output: 'List',
      message0: 'lput thing %1 list %2',
      args0: [
        { 
          type: 'input_value',
          align: 'RIGHT',
          name: 'thing',
        },
        { 
          type: 'input_value',
          align: 'RIGHT',
          check: 'List',
          name: 'list',
        },
      ]
    },
    generator: function(block) {
      var tokens = ['lput'];
      tokens.push(Blockly.VRMath.valueToCode(block, 'thing', Blockly.VRMath.ORDER_ATOMIC));
      tokens.push(Blockly.VRMath.valueToCode(block, 'list', Blockly.VRMath.ORDER_ATOMIC));
      return [tokens.join(' '), Blockly.VRMath.ORDER_NONE];
    }
  },
  combine: {
    configuration: {
      colour: expressionColor,
      output: ['String', 'List'],
      message0: 'combine %1 %2',
      args0: [
        { 
          type: 'input_value',
          align: 'RIGHT',
          name: 'thingA',
        },
        { 
          type: 'input_value',
          align: 'RIGHT',
          check: ['List', 'String'],
          name: 'thingB',
        },
      ]
    },
    generator: function(block) {
      var tokens = ['combine'];
      tokens.push(Blockly.VRMath.valueToCode(block, 'thingA', Blockly.VRMath.ORDER_ATOMIC));
      tokens.push(Blockly.VRMath.valueToCode(block, 'thingB', Blockly.VRMath.ORDER_ATOMIC));
      return [tokens.join(' '), Blockly.VRMath.ORDER_NONE];
    }
  },

  // Commands
  move: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: '%1 %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'direction',
          options: [
            ['forward', 'forward'],
            ['back', 'back'],
            ['east', 'east'],
            ['west', 'west'],
            ['north', 'north'],
            ['south', 'south'],
            ['up', 'up'],
            ['down', 'down'],
          ]
        },
        {
          type: 'input_value',
          align: 'RIGHT',
          check: ['Integer', 'Real'],
          name: 'distance',
        },
      ]
    },
    generator: function(block) {
      var tokens = [];
      tokens.push(block.getFieldValue('direction'));
      tokens.push(Blockly.VRMath.valueToCode(block, 'distance', Blockly.VRMath.ORDER_FUNCTION_CALL));
      return tokens.join(' ') + '\n';
    }
  },
  setpos: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'setpos %1',
      args0: [
        {
          type: 'input_value',
          align: 'RIGHT',
          check: 'List',
          name: 'position',
        },
      ]
    },
    generator: function(block) {
      var tokens = ['setpos'];
      tokens.push(Blockly.VRMath.valueToCode(block, 'position', Blockly.VRMath.ORDER_FUNCTION_CALL));
      return tokens.join(' ') + '\n';
    }
  },
  setxyz: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'set x %1 y %2 z %3',
      args0: [
        {
          type: 'input_value',
          align: 'RIGHT',
          check: ['Integer', 'Real'],
          name: 'x',
        },
        {
          type: 'input_value',
          align: 'RIGHT',
          check: ['Integer', 'Real'],
          name: 'y',
        },
        {
          type: 'input_value',
          align: 'RIGHT',
          check: ['Integer', 'Real'],
          name: 'z',
        },
      ]
    },
    generator: function(block) {
      var tokens = ['setxyz'];
      tokens.push(Blockly.VRMath.valueToCode(block, 'x', Blockly.VRMath.ORDER_FUNCTION_CALL));
      tokens.push(Blockly.VRMath.valueToCode(block, 'y', Blockly.VRMath.ORDER_FUNCTION_CALL));
      tokens.push(Blockly.VRMath.valueToCode(block, 'z', Blockly.VRMath.ORDER_FUNCTION_CALL));
      return tokens.join(' ') + '\n';
    }
  },
  setd: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'set %1 %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'dimension',
          options: [
            ['x', 'x'],
            ['y', 'y'],
            ['z', 'z'],
          ]
        },
        {
          type: 'input_value',
          align: 'RIGHT',
          check: ['Integer', 'Real'],
          name: 'value',
        },
      ]
    },
    generator: function(block) {
      var tokens = [];
      tokens.push('set' + block.getFieldValue('dimension'));
      tokens.push(Blockly.VRMath.valueToCode(block, 'value', Blockly.VRMath.ORDER_FUNCTION_CALL));
      return tokens.join(' ') + '\n';
    }
  },
  home: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'home',
    },
    generator: function(block) {
      return 'home\n';
    }
  },
  turn: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: '%1 %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'direction',
          options: [
            ['left', 'left'],
            ['right', 'right'],
            ['rollup', 'rollup'],
            ['rolldown', 'rolldown'],
            ['tiltleft', 'tiltleft'],
            ['tiltright', 'tiltright'],
          ]
        },
        {
          type: 'input_value',
          align: 'RIGHT',
          check: ['Integer', 'Real'],
          name: 'angle',
        },
      ]
    },
    generator: function(block) {
      var tokens = [];
      tokens.push(block.getFieldValue('direction'));
      tokens.push(Blockly.VRMath.valueToCode(block, 'angle', Blockly.VRMath.ORDER_FUNCTION_CALL));
      return tokens.join(' ') + '\n';
    }
  },
  print: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'print %1',
      args0: [
        {
          type: 'input_value',
          align: 'RIGHT',
          name: 'value',
        },
      ]
    },
    generator: function(block) {
      var value = Blockly.VRMath.valueToCode(block, 'value', Blockly.VRMath.ORDER_FUNCTION_CALL);
      return 'print ' + value + '\n';
    }
  },
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
