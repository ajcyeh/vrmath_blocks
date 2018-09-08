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

  // Lists and arrays
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

  // Commands
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
  forward: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'forward %1',
      args0: [
        {
          type: 'input_value',
          align: 'RIGHT',
          name: 'distance',
          check: 'Integer'
        },
      ]
    },
    generator: function(block) {
      var distance = Blockly.VRMath.valueToCode(block, 'distance', Blockly.VRMath.ORDER_NONE);
      return 'forward ' + distance + '\n';
    }
  },
  backward: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'backward %1',
      args0: [
        {
          type: 'input_value',
          align: 'RIGHT',
          name: 'distance'
        },
      ]
    },
    generator: function(block) {
      var distance = Blockly.VRMath.valueToCode(block, 'distance', Blockly.VRMath.ORDER_NONE);
      return 'backward ' + distance + '\n';
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

function syncToArity() {
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
          var input = this.appendValueInput('element' + i);
          if (i == 0) {
            input.appendField(this.type);
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
