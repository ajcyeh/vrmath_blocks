/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Helper functions for generating VRMath for blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.VRMath');

goog.require('Blockly.Generator');


/**
 * VRMath code generator.
 * @type {!Blockly.Generator}
 */
Blockly.VRMath = new Blockly.Generator('VRMath');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.VRMath.addReservedWords(
  'forward,backward'
);

Blockly.VRMath.ORDER_ATOMIC = 0;            // 0 "" ...
Blockly.VRMath.ORDER_COLLECTION = 1;        // tuples, lists, dictionaries
Blockly.VRMath.ORDER_STRING_CONVERSION = 1; // `expression...`
Blockly.VRMath.ORDER_MEMBER = 2.1;          // . []
Blockly.VRMath.ORDER_FUNCTION_CALL = 2.2;   // ()
Blockly.VRMath.ORDER_EXPONENTIATION = 3;    // **
Blockly.VRMath.ORDER_UNARY_SIGN = 4;        // + -
Blockly.VRMath.ORDER_BITWISE_NOT = 4;       // ~
Blockly.VRMath.ORDER_MULTIPLICATIVE = 5;    // * / // %
Blockly.VRMath.ORDER_ADDITIVE = 6;          // + -
Blockly.VRMath.ORDER_BITWISE_SHIFT = 7;     // << >>
Blockly.VRMath.ORDER_BITWISE_AND = 8;       // &
Blockly.VRMath.ORDER_BITWISE_XOR = 9;       // ^
Blockly.VRMath.ORDER_BITWISE_OR = 10;       // |
Blockly.VRMath.ORDER_RELATIONAL = 11;       // in, not in, is, is not,
                                            //     <, <=, >, >=, <>, !=, ==
Blockly.VRMath.ORDER_LOGICAL_NOT = 12;      // not
Blockly.VRMath.ORDER_LOGICAL_AND = 13;      // and
Blockly.VRMath.ORDER_LOGICAL_OR = 14;       // or
Blockly.VRMath.ORDER_CONDITIONAL = 15;      // if else
Blockly.VRMath.ORDER_LAMBDA = 16;           // lambda
Blockly.VRMath.ORDER_NONE = 99;             // (...)

Blockly.VRMath.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  // [Blockly.VRMath.ORDER_FUNCTION_CALL, Blockly.VRMath.ORDER_MEMBER],
  // (foo())() -> foo()()
  // [Blockly.VRMath.ORDER_FUNCTION_CALL, Blockly.VRMath.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  // [Blockly.VRMath.ORDER_MEMBER, Blockly.VRMath.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  // [Blockly.VRMath.ORDER_MEMBER, Blockly.VRMath.ORDER_FUNCTION_CALL],

  // not (not foo) -> not not foo
  // [Blockly.VRMath.ORDER_LOGICAL_NOT, Blockly.VRMath.ORDER_LOGICAL_NOT],
  // a and (b and c) -> a and b and c
  // [Blockly.VRMath.ORDER_LOGICAL_AND, Blockly.VRMath.ORDER_LOGICAL_AND],
  // a or (b or c) -> a or b or c
  // [Blockly.VRMath.ORDER_LOGICAL_OR, Blockly.VRMath.ORDER_LOGICAL_OR]
];

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.VRMath.init = function(workspace) {
  /**
   * Empty loops or conditionals are not allowed in VRMath.
   */
  // Create a dictionary of definitions to be printed before the code.
  Blockly.VRMath.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.VRMath.functionNames_ = Object.create(null);

  if (!Blockly.VRMath.variableDB_) {
    Blockly.VRMath.variableDB_ = new Blockly.Names(Blockly.VRMath.RESERVED_WORDS_);
  } else {
    Blockly.VRMath.variableDB_.reset();
  }

  Blockly.VRMath.variableDB_.setVariableMap(workspace.getVariableMap());

  var defvars = [];
  // Add developer variables (not created or named by the user).
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    defvars.push(Blockly.VRMath.variableDB_.getName(devVarList[i], Blockly.Names.DEVELOPER_VARIABLE_TYPE) + ' = None');
  }

  // Add user variables, but only ones that are being used.
  var variables = Blockly.Variables.allUsedVarModels(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars.push(Blockly.VRMath.variableDB_.getName(variables[i].getId(), Blockly.Variables.NAME_TYPE) + ' = None');
  }

  Blockly.VRMath.definitions_['variables'] = defvars.join('\n');
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.VRMath.finish = function(code) {
  // Convert the definitions dictionary into a list.
  // var imports = [];
  // var definitions = [];
  // for (var name in Blockly.VRMath.definitions_) {
    // var def = Blockly.VRMath.definitions_[name];
    // if (def.match(/^(from\s+\S+\s+)?import\s+\S+/)) {
      // imports.push(def);
    // } else {
      // definitions.push(def);
    // }
  // }
  // Clean up temporary data.
  delete Blockly.VRMath.definitions_;
  delete Blockly.VRMath.functionNames_;
  Blockly.VRMath.variableDB_.reset();
  // var allDefs = imports.join('\n') + '\n\n' + definitions.join('\n\n');
  // return allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
  return code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.VRMath.scrubNakedValue = function(line) {
  return line + '\n';
};

/**
 * Encode a string as a properly escaped VRMath string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} VRMath string.
 * @private
 */
Blockly.VRMath.quote_ = function(string) {
  // Can't use goog.string.quote since % must also be escaped.
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\%/g, '\\%');

  // Follow the CVRMath behaviour of repr() for a non-byte string.
  var quote = '\'';
  if (string.indexOf('\'') !== -1) {
    if (string.indexOf('"') === -1) {
      quote = '"';
    } else {
      string = string.replace(/'/g, '\\\'');
    }
  };
  return quote + string + quote;
};

/**
 * Common tasks for generating VRMath from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The VRMath code created for this block.
 * @return {string} VRMath code with comments and subsequent blocks added.
 * @private
 */
Blockly.VRMath.scrub_ = function(block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    comment = Blockly.utils.wrap(comment, Blockly.VRMath.COMMENT_WRAP - 3);
    if (comment) {
      if (block.getProcedureDef) {
        // Use a comment block for function comments.
        commentCode += '"""' + comment + '\n"""\n';
      } else {
        commentCode += Blockly.VRMath.prefixLines(comment + '\n', '# ');
      }
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.VRMath.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.VRMath.prefixLines(comment, '# ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.VRMath.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
